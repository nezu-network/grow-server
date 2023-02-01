import { PieceContext } from "@sapphire/pieces";
import { Peer, Variant } from "growsockets";
import { Action } from "../Stores/Action";

export class EnterGame extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "quit_to_exit",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        const players = await this.container.server.prisma.player.findMany({
            where: { 
                lastNetId: { not: -1 }
            }
        });

        peer.send(
            Variant.from("OnRequestWorldSelectMenu"),
            Variant.from(
                "OnConsoleMessage",
                `Where would you like to go? (\`w${players.length}\`\` online)`,
            ),
        );
    }
}