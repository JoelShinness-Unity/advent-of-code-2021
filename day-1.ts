import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { add, aMap } from './lib';

async function *linesFromMock():AsyncIterableIterator<string>{
  const mock = `199
200
208
210
200
207
240
269
260
263`
  yield *mock.split('\n');
}

async function *linesFromFile():AsyncIterableIterator<string>{
  const fileStream = fs.createReadStream(path.join(__dirname, './inputs/day-1.txt'));
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl){
    yield line
  }
}


async function challenge1(lines:AsyncIterableIterator<string>){
  let last;
  let increases = 0;
  for await(const line of lines){
    const numLine = Number(line)
    if(last !== undefined && numLine > last){
      increases++;
    }
    last = numLine
  }

  console.log(increases)
}

async function challenge2(lines:AsyncIterableIterator<string>){
  let lastThree = [];
  let increases = 0;

  for await(const line of aMap(lines, Number)){
    const nextThree = [line, ...lastThree.slice(0, 2)]
    if(lastThree.length == 3  && lastThree.reduce(add) < nextThree.reduce(add)){
      increases++;
    }
    lastThree = nextThree
  }

  console.log(increases)
}
(async() => {
  challenge2(linesFromFile());
})();