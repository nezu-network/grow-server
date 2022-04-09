import { container, StoreRegistry } from "@sapphire/pieces";
import { DefaultCache, Server } from "growsockets";
import { join } from "node:path";
import { ListenerStore } from "../Stores/ListenerStore";
import { Hash } from "../Utilities/Functions/Hash";
import fs from "node:fs";
import { ActionStore } from "../Stores/ActionStore";

export class GrowServer extends Server<unknown, unknown, unknown> {
    public constructor() {
        super({
            cache: new DefaultCache(),
            http: { enabled: process.env.ENABLE_HTTP === "true" },
            usingNewPacket: false
        })

        container.server = this;
        container.logger = this.log;
    }

    /** TODO: handle with redis cache. */
    public userGrowIdCache = new Map();
    public stores = new StoreRegistry();
    public async listen() {
        this.stores.register(new ListenerStore().registerPath(join(__dirname, '..', 'Listeners')));
        this.stores.register(new ActionStore().registerPath(join(__dirname, '..', 'Actions')));
        container.stores = this.stores;

        await Promise.all([...this.stores.values()].map((store) => store.loadAll()));
        return super.listen();
    }

    public data = {
        items: {
            hash: `${Hash(fs.readFileSync("./assets/dat/items.dat"))}`,
            content: fs.readFileSync("./assets/dat/items.dat"),
        }
    }
}

declare module '@sapphire/pieces' {
	interface Container {
		server: GrowServer;
		stores: StoreRegistry;
        logger: GrowServer["log"];
	}

	interface StoreRegistryEntries {
		listeners: ListenerStore;
        actions: ActionStore;
	}
} 