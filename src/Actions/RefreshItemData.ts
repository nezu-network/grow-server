import { PieceContext } from "@sapphire/pieces";
import { Peer, TankPacket, Variant } from "growsockets";
import { Action } from "../Stores/Action";
import { TankTypes } from "../Utilities/Enums/TankTypes";

export class RefreshItemData extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "refresh_item_data",
        })
    }
    public async run(peer: Peer<unknown>, actions: Map<unknown, any>) {
        peer.send(
            Variant.from("OnConsoleMessage", "One moment. Updating item data..."),
            TankPacket.from(
                {
                    type: TankTypes.PEER_ITEMS_DAT,
                    data: () => this.container.server.data.items.content,
                }
            )
        )
    }
}