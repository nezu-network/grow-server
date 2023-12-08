import { PieceContext } from "@sapphire/pieces";
import { Dialog } from "../Stores/Dialog";
import crypto, { randomBytes } from "crypto";
import { Peer, Variant } from "growtopia.js";

export class RegisterDialog extends Dialog {
    public constructor(context: PieceContext) {
        super(context, {
            name: "register",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<string, string | undefined>) {
        const username = actions.get("username") ?? "";
        const password = actions.get("password") ?? "";
        const password_verify = actions.get("password_verify") ?? "";
        const email = actions.get("email") ?? "";

        if (password_verify !== password) {
            throw new Error("The passwords you entered does not match.");
        }

        if (!/^[a-zA-Z0-9]*$/.test(username)) {
            throw new Error("The username you entered is invalid.");
        }

        if (username.length < 3 || username.length > 16) {
            throw new Error("The username you entered is invalid.");
        }

        if (password.length < 8 || password.length > 18) {
            throw new Error("The password you entered is invalid.");
        }

        if (!/^[a-zA-Z0-9@#!$^&*.,]*$/.test(password)) {
            throw new Error("The password you entered is invalid.");
        }

        if (!/^[a-zA-Z0-9@#!$^&*.,]*$/.test(password_verify)) {
            throw new Error("The password you entered is invalid.");
        }

        if (!/^[a-zA-Z0-9.@+_-]*$/.test(email)) {
            throw new Error("The email you entered is invalid.");
        }

        const playerUsername = await this.container.server.prisma.player.findFirst({
            where: {
                name: username
            }
        });

        if (playerUsername) {
            throw new Error("The username you entered is already taken.");
        }

        const playerEmail = await this.container.server.prisma.player.findFirst({
            where: {
                email: username
            }
        });
        
        if (playerEmail) {
            throw new Error("The email you entered is already taken.");
        }

        const cipher = crypto.createCipheriv("aes-256-cbc", process.env.KEY!, process.env.IV!);
        const encrypted = cipher.update(password);
        const encryptedString = Buffer.concat([encrypted, cipher.final()]).toString("hex");

        const guest = await this.container.server.prisma.player.findFirst({
            where: {
                lastNetId: peer.data?.netID,
                name: null,
                password: null,
                email: null
            },
            select: { id: true }
        });

        if (guest === null) {
            throw new Error("You looks suspicious...")
        } else {
            await this.container.server.prisma.player.update({
                where: {
                    id: guest.id,
                },
                data: {
                    name: username,
                    password: encryptedString,
                    email,
                    lastNetId: -1,
                    id: randomBytes(32).toString("hex")
                }
            });
        }
        peer.send(
            Variant.from("SetHasGrowID", 1, username, password),
            Variant.from({ delay: 500 }, "OnConsoleMessage","Please Re-login to validate session !")
        );

        peer.disconnect("now");
    }
}