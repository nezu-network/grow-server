import { PieceContext } from "@sapphire/pieces";
import { Peer, Variant } from "growsockets";
import { Action } from "../Stores/Action";

export class EnterGame extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "enter_game",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        peer.send(
            Variant.from("OnRequestWorldSelectMenu"),
            Variant.from(
            "OnConsoleMessage",
            `Welcome \`1${this.container.server.userGrowIdCache.get(peer.data.netID)}\`\`. Where would you like to go?`
            ),
        );
    }
}