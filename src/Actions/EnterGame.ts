import { PieceContext } from "@sapphire/pieces";
import { Action } from "../Stores/Action";
import { Peer, Variant } from "growtopia.js";

export class EnterGame extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "enter_game",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        const player = await this.container.server.prisma.player.findFirst({
            where: {
                lastNetId: peer.data?.netID
            }
        });

        const players = await this.container.server.prisma.player.count({
            where: { 
                lastNetId: { not: -1 }
            }
        });

        peer.send(
            Variant.from(
                "OnConsoleMessage",
                `Welcome back, \`8@${player?.name ? player!.name: `${player!.requestedName}_${player!.tag}`}\`\`.`,
            ),
            Variant.from("OnRequestWorldSelectMenu"),
            Variant.from(
                "OnConsoleMessage",
                `Where would you like to go? (\`w${players}\`\` online)`,
            ),
            Variant.from({ delay: 100 }, "OnDialogRequest", "set_default_color|`w\nadd_label_with_icon|big|The Growtopia Gazette|left|5016|\nadd_spacer|small|\nadd_image_button|banner|interface/large/news_banner.rttex|noflags|||\nadd_spacer|small|\nadd_textbox|January 31th: `5Nezu Network now online !|left|\nadd_quick_exit|\nend_dialog|gazzette_end||Ok|\n")
        );
    }
}