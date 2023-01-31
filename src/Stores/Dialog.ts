import { Piece } from "@sapphire/pieces";

export abstract class Dialog extends Piece {
    public abstract run(...args: unknown[]): unknown;
}