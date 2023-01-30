import { Piece, PieceContext } from "@sapphire/pieces";
import { fromAsync, isErr } from "@sapphire/result";
import EventEmitter from "node:events";

export abstract class Listener extends Piece {
    private _listener: ((...args: any[]) => void) | null;
    public readonly emitter: EventEmitter | null;
    public abstract run(...args: unknown[]): unknown;

    public constructor(context: PieceContext, public options: ListenerOptions) {
        super(context, options);
        this.emitter =
			typeof options.emitter === 'undefined'
				? this.container.server
				: (typeof options.emitter === 'string' ? (Reflect.get(this.container.server, options.emitter) as EventEmitter) : options.emitter) ??
				  null;
        this._listener = this.emitter && (options.event ?? options.name) ? (options.once ? this._runOnce.bind(this) : this._run.bind(this)) : null;

        if (this.emitter === null || this._listener === null) this.enabled = false;
    }

    public onLoad() {
		if (this._listener) {
			const emitter = this.emitter!;

			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners + 1);

			emitter[this.options.once ? 'once' : 'on'](this.options.event ?? this.options.name, this._listener);
		}
		return super.onLoad();
	}

	public onUnload() {
		if (!this.options.once && this._listener) {
			const emitter = this.emitter!;

			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners - 1);

			emitter.off(this.options.event ?? this.options.name, this._listener);
			this._listener = null;
		}

		return super.onUnload();
	}

    private async _run(...args: unknown[]) {
		const result = await fromAsync(() => this.run(...args));
		if (isErr(result)) {
			this.container.server.emit("listenerError", result.error, { piece: this });
		}
	}

	private async _runOnce(...args: unknown[]) {
		await this._run(...args);
		await this.unload();
	}


}

export interface ListenerOptions {
    name: string;
    event?: string;
    emitter?: string;
    once?: boolean;
} 