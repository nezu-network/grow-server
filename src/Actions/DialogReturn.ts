import { PieceContext } from "@sapphire/pieces";
import { Action } from "../Stores/Action";
import { fromAsync, isErr } from "@sapphire/result";
import { Peer, Variant } from "growtopia.js";

export class EnterGame extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "dialog_return",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        const dialog = this.container.stores.get("dialogs").get(actions.get("dialog_name"));

        if (dialog) {
            const result = await fromAsync(() => dialog.run(peer, actions));
            if (isErr(result)) {
                peer.send(
                    Variant.from("OnConsoleMessage", `An error occured when running this dialog: ${result.error}`),
                )

                peer.send(
                    Variant.from(
                        "OnDialogRequest",
                        `text_scaling_string||\nset_default_color|\`o\nadd_label_with_icon|big|\`wAn error occurred when running the dialog\`\`|left|1432|\nadd_spacer|small|\nadd_textbox|${result.error}|left|\nend_dialog|end||Ok|\n`
                    )
                )
            }
        } else if (!["gazzette_end", "end"].includes(actions.get("dialog_name"))) {
            peer.send(
                Variant.from(
                    "OnDialogRequest",
                    `text_scaling_string||\nset_default_color|\`o\nadd_label_with_icon|big|\`wAn error occurred when running the dialog\`\`|left|1432|\nadd_spacer|small|\nadd_textbox|This dialog not exist|left|\nend_dialog|end||Ok|\n`
                )
            )
        }
    }
}