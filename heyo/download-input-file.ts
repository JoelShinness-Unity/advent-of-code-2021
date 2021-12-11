import axios from "axios";
import { sessionSecret } from '../session.json';
import fs from 'fs/promises';
import path from 'path';

export async function downloadInputFile(day:string){
  const { data } = await axios.get(`https://adventofcode.com/2021/day/${day}/input`, {
    headers: {
      Cookie: `session=${sessionSecret}`
    }
  });
  
  await fs.writeFile(path.join(__dirname, `../inputs/day-${day}.txt`), data);
}

