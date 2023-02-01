import { WorldBlock } from "@prisma/client";
import { ActionTypes, ExtraTypes, Flags } from "../Enums/Tiles";

export function TileExtra(block: Omit<WorldBlock, "id" | "world" | "worldId">, type?: number) {
    switch (type) {
        case ActionTypes.PORTAL:
        case ActionTypes.DOOR:
        case ActionTypes.MAIN_DOOR: {
            const label = (block.door as { label?: string }).label ?? "";
            const buffer = Buffer.alloc(12 + label.length);

            buffer.writeUInt32LE(block.fg | (block.bg << 16));
            buffer.writeUint16LE(0x0, 4);
            buffer.writeUint16LE(Flags.FLAGS_TILEEXTRA, 6);

            buffer.writeUint8(ExtraTypes.DOOR, 8);
            buffer.writeUint16LE(label.length, 9);
            buffer.write(label, 11);
            // Is the door locked or no. (0x8/0x0)
            buffer.writeUint8(0x0, 11 + label.length);

            return buffer;
        }

        case ActionTypes.SIGN: {
            let flag = 0x0;
            const label = (block.sign as { label?: string }).label ?? "";
            const buf = Buffer.alloc(15 + label.length);
      
            if (block.rotatedLeft) flag |= Flags.FLAGS_ROTATED_LEFT;
      
            buf.writeUInt32LE(block.fg | (block.bg << 16));
            buf.writeUint16LE(0x0, 4);
            buf.writeUint16LE(Flags.FLAGS_TILEEXTRA, 6);
      
            buf.writeUint8(ExtraTypes.SIGN, 8);
            buf.writeUint16LE(label.length, 9);
            buf.write(label, 11);
            buf.writeInt32LE(-1, 11 + label.length);
      
            return buf;
          }

        default: {
            const buffer = Buffer.alloc(8);
      
            buffer.writeUInt32LE(block.fg | (block.bg << 16));
            buffer.writeUint16LE(0x0, 4);
            buffer.writeUint16LE(Flags.FLAGS_PUBLIC, 6);
      
            return buffer;
        }
    }
}