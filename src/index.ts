import fs from "node:fs";
import { Server, DefaultCache } from "growsockets";

if (!fs.existsSync("./assets/dat/items.dat")) {
    throw new Error("Could not find \'items.dat\' in \'./assets/dat/\', forgot to add it?");
}

const GrowServer = new Server({
    port: Number(process.env.GROW_PORT),
    http: { serverPort: Number(process.env.GROW_HTTP_SERVER_PORT), enabled: true },
    cache: new DefaultCache(),
    usingNewPacket: true
});

GrowServer.listen();