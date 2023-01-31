import { PieceContext } from "@sapphire/pieces";
import { Listener } from "../Stores/Listener";

export class Disconnect extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "disconnect"
        })
    }
    public async run(netID: number) {
        await this.container.logger("Peer", netID, "Disconnected.");
        await this.container.server.prisma.player.update({
            where: {
                lastNetId: netID
            },
            data: {
                lastNetId: -1
            }
        });
    }
}