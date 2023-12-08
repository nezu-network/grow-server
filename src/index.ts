import fs from "node:fs";
import { GrowServer } from "./Structures/GrowServer";

if (!fs.existsSync("./assets/dat/items.dat")) {
    throw new Error("Could not find \'items.dat\' in \'./assets/dat/\', forgot to add it?");
}

if (process.env.ENABLE_WEBSERVER === "true") {
    if (!fs.existsSync("./assets/ssl/server.cert")) {
        throw new Error("Could not find \'server.cert\' in \'./assets/ssl/\', forgot to add it?");
    }
    
    if (!fs.existsSync("./assets/ssl/server.key")) {
        throw new Error("Could not find \'server.key\' in \'./assets/ssl/\', forgot to add it?");
    }
}

const server = new GrowServer();

server.listen();

process.on("SIGINT", () => {
    server.shutdown()
    return process.exit();
});
process.on("SIGQUIT", () => {
    server.shutdown()
    return process.exit();
});
process.on("SIGTERM", () => {
    server.shutdown()
    return process.exit();
});