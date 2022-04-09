import fs from "node:fs";
import { GrowServer } from "./Structures/GrowServer";

if (!fs.existsSync("./assets/dat/items.dat")) {
    throw new Error("Could not find \'items.dat\' in \'./assets/dat/\', forgot to add it?");
}

const server = new GrowServer();

server.listen();