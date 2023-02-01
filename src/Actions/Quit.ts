import { PieceContext } from "@sapphire/pieces";
import { Peer } from "growsockets";
import { Action } from "../Stores/Action";

export class Quit extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "quit",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        await this.container.server.prisma.player.update({
            where: {
                lastNetId: peer.data.netID
            },
            data: {
                lastNetId: -1
            }
        });
    }
}