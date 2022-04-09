export function Hash(file: Buffer) {
    let hash = 0x55555555;
    file.forEach((x) => (hash = (hash >>> 27) + (hash << 5) + x));
    return hash >>> 0;
};