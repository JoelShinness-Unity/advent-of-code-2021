import path from "path";
import fs from 'fs/promises';

export async function createCodeFile(day:string){
  const filePath = path.join(__dirname, `../day-${day}.ts`);
  try {
    await fs.stat(path.join(__dirname, `../day-${day}.ts`))
  } catch(e){
    const fileCopies = await fs.readFile(path.join(__dirname, '../day-xx.ts'));
    await fs.writeFile(filePath, fileCopies.toString().replace('xx', day));
  }
}
