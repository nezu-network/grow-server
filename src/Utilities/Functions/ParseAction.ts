export default function ParseAction(chunk: Buffer) {
    chunk[chunk.length - 1] = 0;
  
    const str = chunk.toString("utf-8", 4);
    const lines = str.split("\n");
  
    const data = new Map();
  
    lines.forEach((line) => {
      if (line.startsWith("|")) line = line.slice(1);
  
      const info = line.split("|");
      let key = info[0],
        val = info[1];
  
      if (key && val) {
        if (val.endsWith("\x00")) val = val.slice(0, -1);
        data.set(key, val);
      }
    });
  
    return data;
  }