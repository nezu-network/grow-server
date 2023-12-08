import { PieceContext } from "@sapphire/pieces";
import { Action } from "../Stores/Action";
import { Peer } from "growtopia.js";

export class Quit extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "quit",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        this.container.server.peerId.delete(peer.data?.netID);
        peer.disconnect("now");
        const player = await this.container.server.prisma.player.findFirst({
            where: {
                lastNetId: peer.data?.netID
            },
            select: { id: true }
        });

        if (player) {
            if (player) {
                await this.container.server.prisma.player.update({
                    where: {
                        id: player.id
                    },
                    data: {
                        lastNetId: -1
                    }
                });
            }
        }
    }
}