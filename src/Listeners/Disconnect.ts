import { PieceContext } from "@sapphire/pieces";
import { Listener } from "../Stores/Listener";

export class Disconnect extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "disconnect"
        })
    }
    public async run(netID: number) {
        this.container.server.userGrowIdCache.delete(netID);
    }
}