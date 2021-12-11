import { exec, spawn } from 'child_process';
import { waitTillMidnight } from './wait-till-midnight';
import { downloadInputFile } from './download-input-file';
import { createCodeFile } from './create-code-file';
import { spawnPromise } from './spawn-promise';

(async () => {
  const day = process.argv[2];
  await waitTillMidnight(day);
  await downloadInputFile(day);
  await createCodeFile(day);
  
  await spawnPromise('code', [`./day-${day}.ts`]);
  await spawnPromise('open', [`https://adventofcode.com/2021/day/${day}`]);
  await spawnPromise('npx', ['nodemon', `./day-${day}.ts`]);
})();
