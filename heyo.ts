import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { argv } from 'process';
import {sessionSecret} from './session.json';

import momentTz from 'moment-timezone';

(async () => {
  const day = argv[2];
  const upcoming = momentTz.tz(`2021-12-${day.padStart(2, "0")}`, "America/New_York").toDate();
  const diffMS = (+upcoming - +(new Date()))
  const diff = diffMS / (1000 * 60 * 60)
  if(diffMS > 0){
    console.log(`Waiting for midnight in ${diff} hrs`);
    await new Promise((resolve) => {
      setTimeout(resolve, diffMS);
    });
  }
  try {
    const { data } = await axios.get(`https://adventofcode.com/2021/day/${day}/input`, {
      headers: {
        Cookie: `session=${sessionSecret}`
      }
    });
    
    await fs.writeFile(path.join(__dirname, `./inputs/day-${day}.txt`), data);
  } catch(e){}

  const filePath = path.join(__dirname, `./day-${day}.ts`);
  try {
    await fs.stat(path.join(__dirname, `./day-${day}.ts`))
  } catch(e){
    const fileCopies = await fs.readFile(path.join(__dirname, './day-xx.ts'));
    await fs.writeFile(filePath, fileCopies.toString().replace('xx', day));
  }
})();
