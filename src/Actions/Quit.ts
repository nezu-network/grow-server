import { PieceContext } from "@sapphire/pieces";
import { Peer, TankPacket, Variant } from "growsockets";
import { Action } from "../Stores/Action";
import { TankTypes } from "../Utilities/Enums/TankTypes";

export class RefreshItemData extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "quit",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        this.container.server.userGrowIdCache.delete(peer.data.netID);
        peer.disconnect();
    }
}