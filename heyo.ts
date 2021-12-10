import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { argv, stderr } from 'process';
import { sessionSecret } from './session.json';

import momentTz from 'moment-timezone';
import { exec, spawn } from 'child_process';
import { chunk } from 'lodash';

(async () => {
  const day = argv[2];
  const upcoming = momentTz.tz(`2021-12-${day.padStart(2, "0")}`, "America/New_York").toDate();
  const diffMS = (+upcoming - +(new Date()))
  const diffInHours = diffMS / (1000 * 60 * 60);
  
  if(diffMS > 0){
    console.log(`Waiting for midnight in ${diffInHours} hrs`);
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
  
  exec(`code ./day-${day}.ts`);
  exec(`open https://adventofcode.com/2021/day/${day}`);
  await new Promise((resolve, reject) => {
    const nodemon = spawn(`npx`, ['nodemon', `./day-${day}.ts`]);
    nodemon.stdout.on("data", (chunk) => {
      console.log(chunk.toString());
    });
    nodemon.stderr.on("data", (chunk) => {
      console.error(chunk.toString())
    })
    nodemon.on('error', reject);
    nodemon.on('close', resolve);
    nodemon.on('exit', resolve);
    nodemon.on('disconnect', resolve);
  })
})();
