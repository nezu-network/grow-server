import { PieceContext } from "@sapphire/pieces";
import { Peer, TankPacket, Variant } from "growsockets";
import { Action } from "../Stores/Action";
import { TankTypes } from "../Utilities/Enums/TankTypes";
import { TileExtra } from "../Utilities/Functions/TIleExtra";
import { WorldBlock } from "@prisma/client";
import { randomBytes } from "crypto";

export class JoinRequest extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "join_request",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<string, string | undefined>) {
        const name = actions.get("name")?.toUpperCase() ?? "";

        if (name.length < 1 || name.length > 16) {
            return peer.send(
                Variant.from("OnFailedToEnterWorld", 1),
                Variant.from("OnConsoleMessage", "World name must be between 1 and 16 characters long.")
            );
        }

        if (name === "EXIT") {
            return peer.send(
                Variant.from("OnFailedToEnterWorld", 1),
                Variant.from("OnConsoleMessage", "Exit from what? click back if you're done playing.")
            );
        }

        if (!/^[a-zA-Z0-9]*$/.test(name)) {
            return peer.send(
                Variant.from("OnFailedToEnterWorld", 1),
                Variant.from("OnConsoleMessage", "Symbol cannot be used for a world name.")
            );
        }

        const player = await this.container.server.prisma.player.findUnique({ 
            where: {
                lastNetId: peer.data.netID
            }
        });

        const world = await this.container.server.prisma.world.findFirst({
            where: {
                name
            },
            select: {
                height: true,
                witdh: true,
                blockCount: true,
                id: true
            }
        });

        if (world) {
            const blocks = await this.container.server.prisma.worldBlock.findMany({
                where: {
                    worldId: world.id
                }
            });

            const tank = this.blocksTankPacket(blocks, name, world.witdh, world.height, world.blockCount);

            const mainDoor = blocks.find((block) => block.fg === 6);
            const xPos = (mainDoor?.x ?? 0) * 32
            const yPos = (mainDoor?.y ?? 0) * 32;

            peer.send(tank);

            peer.send(
                Variant.from(
                  { delay: -1 },
                  "OnSpawn",
                  "spawn|avatar\n" +
                    `netID|${peer.data.netID}\n` +
                    `userID|${player!.id}\n` +
                    `colrect|0|0|20|30\n` +
                    `posXY|${xPos}|${yPos}\n` +
                    `name|\`w${player!.name}\`\`\n` +
                    `country|us\n` +
                    "invis|0\n" +
                    "mstate|0\n" +
                    "smstate|0\n" +
                    "onlineID|\n" +
                    "type|local"
                ),
          
                Variant.from(
                  {
                    netID: peer.data.netID
                  },
                  "OnSetClothing",
                  [0, 0, 0],
                  [0, 0, 0],
                  [0, 0, 0],
                  0x8295c3ff,
                  [0, 0.0, 0.0]
                )
              );
        } else {
            const blocks: Omit<WorldBlock, "id" | "world" | "worldId">[] = [];
            const height = 100;
            const witdh = 60;
            const blockCount = height * witdh;
            let x = 0;
            let y = 0;

            const Y_START_DIRT = 24;
            const Y_LAVA_START = 50;
            const Y_END_DIRT = 55;

            const mainDoorLocation = Math.floor(Math.random() * witdh);

            for (let i = 0; i < blockCount; i++) {
                if (x >= witdh) {
                    y++;
                    x = 0;
                }
                
                const block: Omit<WorldBlock, "id" | "world" | "worldId"> = { x, y, fg: 0, bg: 0, rotatedLeft: false, door: null, sign: null, lock: null };

                if (block.y === (Y_START_DIRT - 1) && block.x === mainDoorLocation) {
                    block.fg = 6;
                    block.door = {
                        label: "EXIT",
                        destination: "EXIT"
                    }
                } else if (block.y >= Y_START_DIRT) {
                    block.fg =
                        block.x === mainDoorLocation && block.y === Y_START_DIRT
                            ? 8
                            : block.y! < Y_END_DIRT
                        ? block.y! >= Y_LAVA_START
              ? Math.random() > 0.2
                ? Math.random() > 0.1
                  ? 2
                  : 10
                : 4
              : Math.random() > 0.01
              ? 2
              : 10
            : 8;
                        block.bg = 14;
                }

                blocks.push(block);
                x++;
            }

            const tank = this.blocksTankPacket(blocks, name, witdh, height, blockCount);

            const mainDoor = blocks.find((block) => block.fg === 6);
            const xPos = (mainDoor?.x ?? 0) * 32
            const yPos = (mainDoor?.y ?? 0) * 32;

            const world = await this.container.server.prisma.world.create({
                data: {
                    id: randomBytes(32).toString("hex"),
                    blockCount,
                    witdh,
                    height,
                    name,
                    ownerId: player!.id
                }
            });

            for (const block of blocks) {
                await this.container.server.prisma.worldBlock.create({
                    data: {
                        id: randomBytes(32).toString("hex"),
                        worldId: world.id,
                        x: block.x,
                        y: block.y,
                        fg: block.fg,
                        bg: block.bg,
                        rotatedLeft: block.rotatedLeft,
                        door: block.door ?? undefined,
                        sign: block.sign ?? undefined,
                        lock: block.lock ?? undefined
                    }
                })
            }

            peer.send(tank);

            peer.send(
                Variant.from(
                  { delay: -1 },
                  "OnSpawn",
                  "spawn|avatar\n" +
                    `netID|${peer.data.netID}\n` +
                    `userID|${player!.id}\n` +
                    `colrect|0|0|20|30\n` +
                    `posXY|${xPos}|${yPos}\n` +
                    `name|\`w${player!.name}\`\`\n` +
                    `country|us\n` +
                    "invis|0\n" +
                    "mstate|0\n" +
                    "smstate|0\n" +
                    "onlineID|\n" +
                    "type|local"
                ),
          
                Variant.from(
                  {
                    netID: peer.data.netID
                  },
                  "OnSetClothing",
                  [0, 0, 0],
                  [0, 0, 0],
                  [0, 0, 0],
                  0x8295c3ff,
                  [0, 0.0, 0.0]
                )
              );
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

