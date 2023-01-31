import { Store } from "@sapphire/pieces";
import { Dialog } from "./Dialog";

export class DialogStore extends Store<Dialog> {
    public constructor() {
        super(Dialog as any, { name: "dialogs" });
    }
} 