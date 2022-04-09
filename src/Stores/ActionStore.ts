import { Store } from "@sapphire/pieces";
import { Action } from "./Action";

export class ActionStore extends Store<Action> {
    public constructor() {
        super(Action as any, { name: "actions" });
    }
} 