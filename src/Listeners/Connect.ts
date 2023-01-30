import { PieceContext } from "@sapphire/pieces";
import { Peer, TextPacket } from "growsockets";
import { Listener } from "../Stores/Listener";

export class Connect extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "connect"
        })
    }
    public async run(netID: number) {
        await this.container.logger("Peer", netID, "connected.");

        const peer = Peer.new(this.container.server, netID);
        const packet = TextPacket.from(0x1);

        peer.send(packet);
    }
}