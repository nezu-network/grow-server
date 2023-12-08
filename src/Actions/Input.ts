import { PieceContext } from "@sapphire/pieces";
import { Action } from "../Stores/Action";
import { Peer, Variant } from "growtopia.js";

export class Input extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "input",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<string, string>) {
        const player = await this.container.server.prisma.player.findFirst({
            where: {
                lastNetId: peer.data?.netID
            }
        });

        peer.send(
            Variant.from("OnTalkBubble", peer.data?.netID!, `\`^${actions.get("text")!}`, 0),
            Variant.from(
              "OnConsoleMessage",
              `CP:0_PL:0_OID:_CT:[W]_ <\`8@${player?.name ? player!.name: `${player!.requestedName}_${player!.tag}`}\`\`> \`^${actions.get("text")!}`
            )
        );
    }
}