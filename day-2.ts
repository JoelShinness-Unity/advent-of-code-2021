import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { from, map, Observable, reduce, scan } from 'rxjs';
import { linesFromFile } from './lib';

function linesFromMock():Observable<string>{
  const mock = `forward 5
down 5
forward 8
up 3
down 8
forward 2`
  return from(mock.split('\n'));
}


function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map((line) => {
      const [dir, by] = line.split(' ');
      switch(dir){
        case 'forward': return [Number(by), 0];
        case 'down': return [0, Number(by)];
        default: return [0, -Number(by)]
      }
    }),
    reduce(([aX, aY], [bX, bY]) => [aX + bX, aY + bY], [0, 0]),
    map(([a, b]) => a * b)
  );
}
function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(line => {
      const [dir, by] = line.split(' ');
      return [dir, Number(by)];
    }),
    scan(([hori, depth, aim], [dir, by]:[string, number]) => {
      switch(dir){
        case 'down': return [hori, depth, aim + by];
        case 'up': return [hori, depth, aim - by];
        default: return [hori + by, depth + aim * by, aim]
      }
    }, [0, 0, 0]),
    map(([hori, depth]) => hori * depth)
  );
}

(() => {
  linesFromFile('./inputs/day-2.txt')
    .pipe(challenge2)
    .subscribe(x => { console.log(x); })
})();