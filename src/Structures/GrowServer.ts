import { container, StoreRegistry } from "@sapphire/pieces";
import { join } from "node:path";
import { ListenerStore } from "../Stores/ListenerStore";
import { Hash } from "../Utilities/Functions/Hash";
import fs, { readFileSync } from "node:fs";
import { ActionStore } from "../Stores/ActionStore";
import { DialogStore } from "../Stores/DialogStore";
import { PrismaClient } from "@prisma/client";
import { ItemsDat, ItemsDatMeta, Client } from "growtopia.js";
import { pino } from "pino";
import express from "express";
import http from "node:http";
import https from "node:https";

export class GrowServer extends Client {
    public constructor() {
        super({
            https: {
                enable: false
            }
        })

        container.server = this;
        container.logger = this.logger;
    }
    public logger = pino({
        transport: {
            targets: [
                { target: "pino-pretty", level: "info", options: { translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o" } }
            ]
        }
    });
    public prisma = new PrismaClient();
    public stores = new StoreRegistry();
    public peerId = new Set();
    public async listen() {
        this.stores.register(new ListenerStore().registerPath(join(__dirname, '..', 'Listeners')));
        this.stores.register(new ActionStore().registerPath(join(__dirname, '..', 'Actions')));
        this.stores.register(new DialogStore().registerPath(join(__dirname, '..', 'Dialogs')));
        container.stores = this.stores;

        this.data.items.metadata = await new ItemsDat(fs.readFileSync("./assets/dat/items.dat")).decode();
        this.data.items.hash = `${Hash(fs.readFileSync("./assets/dat/items.dat"))}`;

        await Promise.all([...this.stores.values()].map((store) => store.loadAll()));

        if (process.env.ENABLE_WEBSERVER === "true") {
            const expressApp = express();
            expressApp.use("/growtopia/server_data.php", (req, res) => {
                res.send(
                `server|${process.env.SERVER_ADDRESS}\nport|17091\ntype|1\n#maint|Server is under maintenance. We will be back online shortly. Thank you for your patience! \nmeta|undefined\nRTENDMARKERBS1001`
                );
            });
        
            const httpServer = http.createServer(expressApp);
            const httpsServer = https.createServer({
                key: readFileSync("./assets/ssl/server.key"),
                cert: readFileSync("./assets/ssl/server.cert")
            }, expressApp);

            httpServer.listen(80);
            httpsServer.listen(443);
        }

        await this.prisma.$connect();
        await this.prisma.player.updateMany({ data: { lastNetId: -1 } });
        this.logger.info("Server Ready !")
        
        return super.listen();
    }

    public data = {
        items: {
            hash: `${Hash(fs.readFileSync("./assets/dat/items.dat"))}`,
            content: fs.readFileSync("./assets/dat/items.dat"),
            metadata: {} as ItemsDatMeta
        }
    }

    public shutdown() {
        void this.prisma.player.updateMany({ data: { lastNetId: -1 } });
        void this.prisma.$disconnect();
        this.logger.info("Server gracefully shutdown.");
    }
}

declare module '@sapphire/pieces' {
	interface Container {
        server: GrowServer;
        stores: StoreRegistry;
        logger: GrowServer["logger"];
	}

	interface StoreRegistryEntries {
        listeners: ListenerStore;
        actions: ActionStore;
        dialogs: DialogStore;
	}
} 