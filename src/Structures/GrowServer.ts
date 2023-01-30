import { container, StoreRegistry } from "@sapphire/pieces";
import { DefaultCache, Server } from "growsockets";
import { join } from "node:path";
import { ListenerStore } from "../Stores/ListenerStore";
import { Hash } from "../Utilities/Functions/Hash";
import fs, { readFileSync } from "node:fs";
import { ActionStore } from "../Stores/ActionStore";
import express from "express";
import http from "node:http";
import https from "node:https";

export class GrowServer extends Server<unknown, unknown, unknown> {
    public constructor() {
        super({
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

        const expressApp = express();

        expressApp.use("/growtopia/server_data.php", (req, res) => {
            res.send(
              "server|127.0.0.1\nport|17091\ntype|1\n#maint|Server is under maintenance. We will be back online shortly. Thank you for your patience! \nmeta|undefined\nRTENDMARKERBS1001"
            );
        });
        
        const httpServer = http.createServer(expressApp);
        const httpsServer = https.createServer({
            key: readFileSync("./assets/ssl/server.key"),
            cert: readFileSync("./assets/ssl/server.cert")
        }, expressApp);

        httpServer.listen(80);
        httpsServer.listen(443);
        
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