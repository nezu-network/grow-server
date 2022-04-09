import { Piece } from "@sapphire/pieces";

export abstract class Action extends Piece {
    public abstract run(...args: unknown[]): unknown;
}