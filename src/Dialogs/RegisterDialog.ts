import { PieceContext } from "@sapphire/pieces";
import { Peer, Variant } from "growsockets";
import { Dialog } from "../Stores/Dialog";
import crypto from "crypto";

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

        const player = await this.container.server.prisma.player.findUnique({
            where: {
                name: username
            }
        });

        if (player) {
            throw new Error("The username you entered is already taken.");
        }

        const cipher = crypto.createCipheriv("aes-256-cbc", process.env.KEY!, process.env.IV!);
        const encrypted = cipher.update(password);
        const encryptedString = Buffer.concat([encrypted, cipher.final()]).toString("hex");

        await this.container.server.prisma.player.create({
            data: {
                name: username,
                password: encryptedString,
                email,
                lastNetId: peer.data.netID,
            }
        });

        peer.send(
            Variant.from(
                "OnSuperMainStartAcceptLogonHrdxs47254722215a",
                this.container.server.data.items.hash,
                "ubistatic-a.akamaihd.net",
                "0098/23840/cache/",
                "cc.cz.madkite.freedom org.aqua.gg idv.aqua.bulldog com.cih.gamecih2 com.cih.gamecih com.cih.game_cih cn.maocai.gamekiller com.gmd.speedtime org.dax.attack com.x0.strai.frep com.x0.strai.free org.cheatengine.cegui org.sbtools.gamehack com.skgames.traffikrider org.sbtoods.gamehaca com.skype.ralder org.cheatengine.cegui.xx.multi1458919170111 com.prohiro.macro me.autotouch.autotouch com.cygery.repetitouch.free com.cygery.repetitouch.pro com.proziro.zacro com.slash.gamebuster",
                "proto=117|choosemusic=audio/mp3/about_theme.mp3|active_holiday=9|server_tick=226933875|wing_week_day=0|server_tick=48726610|clash_active=0|drop_lavacheck_faster=1|isPayingUser=0|usingStoreNavigation=1|enableInventoryTab=1|bigBackpack=1|" 
            ),
            Variant.from("SetHasGrowID", 1, username, password)
        )
    }
}