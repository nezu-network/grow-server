import { PieceContext } from "@sapphire/pieces";
import { Action } from "../Stores/Action";
import { Peer, Variant } from "growtopia.js";

export class Growid extends Action {
    public constructor(context: PieceContext) {
        super(context, {
            name: "growid",
        })
    }
    public async run(peer: Peer<{ netID: number }>, actions: Map<unknown, any>) {
        peer.send(
            Variant.from(
                { delay: 500 },
                "OnDialogRequest",
                "text_scaling_string||\nset_default_color|`o\nadd_label_with_icon|big|`wGet a GrowID``|left|206|\nadd_spacer|small|\nadd_textbox|By choosing a `wGrowID``, you can use a name and password to logon from any device. Your `wname`` will be shown to other players!|left|\nadd_spacer|small|\nadd_text_input|username|Name||18|\nadd_textbox|Your `wpassword`` must contain `w8 to 18 characters, 1 letter, 1 number`` and `w1 special character: @#!$^&*.,``|left|\nadd_text_input_password|password|Password||18|\nadd_text_input_password|password_verify|Password Verify||18|\nadd_textbox|Your `wemail`` will only be used for account verification and support. If you enter a fake email, you can't verify your account, recover or change your password.|left|\nadd_text_input|email|Email||64|\nadd_textbox|We will never ask you for your password or email, never share it with anyone!|left|\nend_dialog|register|Cancel|Get My GrowID!|\n"
            )
        )
    }
}