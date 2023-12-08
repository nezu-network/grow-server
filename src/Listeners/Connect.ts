import { PieceContext } from "@sapphire/pieces";
import { Listener } from "../Stores/Listener";
import { Peer, TextPacket } from "growtopia.js";

export class Connect extends Listener {
    public constructor(context: PieceContext) {
        super(context, {
            name: "connect"
        })
    }
    public async run(netID: number) {
        this.container.server.peerId.add(netID);
        const peer = new Peer<{ netID: number }>(this.container.server, netID);
        const packet = TextPacket.from(0x1);

        this.container.logger.info(`Peer with netID ${peer.data?.netID} connected !`);
        peer.send(packet);
    }
}