import { PieceContext } from "@sapphire/pieces";
import { fromAsync, isErr } from "@sapphire/result";
import { Listener } from "../Stores/Listener";
import { DataTypes } from "../Utilities/Enums/DataTypes";
import ParseAction from "../Utilities/Functions/ParseAction";
import crypto, { randomBytes } from "node:crypto";
import { WorldBlock } from "@prisma/client";
import { TankTypes } from "../Utilities/Enums/TankTypes";
import { TileExtra } from "../Utilities/Functions/TIleExtra";
import { Peer, TankPacket, Variant } from "growtopia.js";

export class Data extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "raw"
        })
    }

    public generateRandom3DigitNumber() {
        return Math.floor(Math.random() * 900) + 100;
    }

    public async run(netID: number, data: Buffer) {
    const peer: Peer<{ netID: number }> = new Peer(this.container.server, netID);
    
    const dataType = data.readUInt32LE();
    
    switch(dataType) {
        case DataTypes.STR:
        case DataTypes.ACTION: {
                const packetAction = ParseAction(data);
                const action = this.container.stores.get("actions").get(packetAction.get("action"));
                console.log(packetAction);

                const players = await this.container.server.prisma.player.findMany({
                    where: {
                        lastNetId: peer.data?.netID
                    },
                    select: { id: true, lastNetId: true }
                });

                if (players.length >= 2) {
                    for (const player of players) {
                        await this.container.server.prisma.player.update({
                            where: {
                                id: player.id
                            },
                            data: {
                                lastNetId: -1
                            }
                        });
                        if (player.lastNetId && player.lastNetId >= 1 && this.container.server.peerId.has(player.lastNetId)) this.container.server._client.disconnectNow(player.lastNetId);
                    }
                }

                if (packetAction.has("requestedName") && packetAction.has("tankIDName") && packetAction.has("tankIDPass")) {
                    const cipher = crypto.createCipheriv("aes-256-cbc", process.env.KEY!, process.env.IV!);
                    const encrypted = cipher.update(packetAction.get("tankIDPass"));
                    const encryptedString = Buffer.concat([encrypted, cipher.final()]).toString("hex");

                    const player = await this.container.server.prisma.player.findFirst({
                        where: {
                            name: packetAction.get("tankIDName")
                        },
                        select: { password: true, id: true, lastNetId: true }
                    });

                    if (player?.password !== encryptedString) {
                        peer.send(
                            Variant.from(
                              "OnConsoleMessage",
                              "`4Unable to log on:`` That `wGrowID`` doesn't seem valid, or the password is wrong. if you don't have one, click `wCancel``, un-check `w'I have a GrowID'``, then click `wConnect``"
                            )
                        );
                        return peer.disconnect();
                    }

                    if (player.lastNetId !== null && player.lastNetId !== -1 && player.lastNetId !== peer.data?.netID) {
                        peer.send(
                            Variant.from(
                              "OnConsoleMessage",
                              "`4ALREADY ON?!:`` This account was already online, Kicking it off so you can log on."
                            )
                        );
                        if (player.lastNetId >= 1 && this.container.server.peerId.has(player.lastNetId)) this.container.server._client.disconnectNow(player.lastNetId);
                        await this.container.server.prisma.player.update({
                            where: {
                                id: player.id
                            },
                            data: {
                                lastNetId: -1
                            }
                        });
                    }

                    await this.container.server.prisma.player.update({
                        where: {
                            id: player.id
                        },
                        data: {
                            lastNetId: peer.data?.netID
                        }
                    });

                    peer.send(
                        Variant.from(
                            "OnSuperMainStartAcceptLogonHrdxs47254722215a",
                            this.container.server.data.items.hash,
                            "ubistatic-a.akamaihd.net",
                            "0098/23840/cache/",
                            "cc.cz.madkite.freedom org.aqua.gg idv.aqua.bulldog com.cih.gamecih2 com.cih.gamecih com.cih.game_cih cn.maocai.gamekiller com.gmd.speedtime org.dax.attack com.x0.strai.frep com.x0.strai.free org.cheatengine.cegui org.sbtools.gamehack com.skgames.traffikrider org.sbtoods.gamehaca com.skype.ralder org.cheatengine.cegui.xx.multi1458919170111 com.prohiro.macro me.autotouch.autotouch com.cygery.repetitouch.free com.cygery.repetitouch.pro com.proziro.zacro com.slash.gamebuster",
                            "proto=117|choosemusic=audio/ogg/tsirhc.ogg|active_holiday=9|server_tick=226933875|wing_week_day=0|clash_active=1|drop_lavacheck_faster=1|isPayingUser=0|usingStoreNavigation=1|enableInventoryTab=1|bigBackpack=1|" 
                        )
                    );
                } else if (packetAction.has("requestedName") && !packetAction.has("tankIDName") && !packetAction.has("tankIDPass")) {
                    const guest = await this.container.server.prisma.player.findFirst({
                        where: {
                            OR: [
                                {
                                    mac: packetAction.get("mac"),
                                    rid: packetAction.get("rid"),
                                    name: null,
                                    password: null,
                                    email: null
                                },
                                {
                                    mac: packetAction.get("mac"),
                                    name: null,
                                    password: null,
                                    email: null
                                }
                            ]
                        }
                    });
                    const tag = this.generateRandom3DigitNumber();

                    if (guest === null) {
                        await this.container.server.prisma.player.create({
                            data: {
                                id: randomBytes(32).toString("hex"),
                                requestedName: packetAction.get("requestedName"),
                                lastNetId: peer.data?.netID,
                                mac: packetAction.get("mac"),
                                rid: packetAction.get("rid"),
                                tag
                            }
                        });
                    } else {
                        await this.container.server.prisma.player.update({
                            where: {
                                id: guest.id
                            },
                            data: {
                                requestedName: packetAction.get("requestedName"),
                                lastNetId: peer.data?.netID,
                                rid: packetAction.get("rid"),
                                mac: packetAction.get("mac")
                            }
                        })
                    }

                    peer.send(
                        Variant.from(
                            "OnSuperMainStartAcceptLogonHrdxs47254722215a",
                            this.container.server.data.items.hash,
                            "ubistatic-a.akamaihd.net",
                            "0098/23840/cache/",
                            "cc.cz.madkite.freedom org.aqua.gg idv.aqua.bulldog com.cih.gamecih2 com.cih.gamecih com.cih.game_cih cn.maocai.gamekiller com.gmd.speedtime org.dax.attack com.x0.strai.frep com.x0.strai.free org.cheatengine.cegui org.sbtools.gamehack com.skgames.traffikrider org.sbtoods.gamehaca com.skype.ralder org.cheatengine.cegui.xx.multi1458919170111 com.prohiro.macro me.autotouch.autotouch com.cygery.repetitouch.free com.cygery.repetitouch.pro com.proziro.zacro com.slash.gamebuster",
                            "proto=117|choosemusic=audio/ogg/tsirhc.ogg|active_holiday=9|server_tick=226933875|wing_week_day=0|server_tick=48726610|clash_active=0|drop_lavacheck_faster=1|isPayingUser=0|usingStoreNavigation=1|enableInventoryTab=1|bigBackpack=1|" 
                        )
                    );
                }
                
                if (action) {
                    const result = await fromAsync(() => action.run(peer, packetAction));
                    if (isErr(result)) {
                        console.log(result.error);
                        peer.send(
                            Variant.from("OnConsoleMessage", `An error occured when running this action: ${result.error}`),
                        )
                    }
                }
            }
        }
    }

    public blocksTankPacket(blocks: Omit<WorldBlock, "id" | "world" | "worldId">[], name: string, width: number, height: number, blockCount: number) {
        return TankPacket.from({
            type: TankTypes.PEER_WORLD,
            state: 8,
            data: () => {
                const HEADER_LENGTH = name.length + 20;
                const buffer = Buffer.alloc(HEADER_LENGTH);

                buffer.writeUInt16LE(0xf);
                buffer.writeUInt32LE(0x40, 2);
                buffer.writeUInt16LE(name.length, 6);
                buffer.write(name, 8);
                buffer.writeUInt32LE(width, 8 + name.length);
                buffer.writeUInt32LE(height, 12 + name.length);
                buffer.writeUInt32LE(blockCount, 16 + name.length);

                const blockBytes: number[] = [];

                for (const block of blocks) {
                    const item = this.container.server.data.items.metadata.items.find(item => item.id === block.fg);
                    const blockBuffer = TileExtra(block, item?.type);
                    blockBytes.push(...blockBuffer);
                }

                const weather = Buffer.alloc(12);
                    weather.writeUint16LE(0);
                    weather.writeUint16LE(0x1, 2);
                    weather.writeUint32LE(0x0, 4);
                    weather.writeUint32LE(0x0, 8);

                const dropData = Buffer.alloc(8 + [].length * 16);
                    dropData.writeUInt32LE([].length);
                    dropData.writeUInt32LE(0);

                return Buffer.concat([
                    buffer,
                    Buffer.from(blockBytes),
                    Buffer.concat([dropData, weather])
                ]);
            }
        });
    }
}