import { PieceContext } from "@sapphire/pieces";
import { Listener } from "../Stores/Listener";

export class Disconnect extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "disconnect"
        })
    }
    public async run(netID: number) {
        this.container.server.peerId.delete(netID);
        this.container.logger.info(`Peer with netID ${netID} disconnected !`);

        const player = await this.container.server.prisma.player.findFirst({
            where: {
                lastNetId: netID
            },
            select: { id: true }
        });

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