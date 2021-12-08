import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { from, last, map, Observable, reduce, scan, takeLast } from 'rxjs';
import { aMap } from './lib';

function linesFromMock():Observable<string>{
  const mock = `forward 5
down 5
forward 8
up 3
down 8
forward 2`
  return from(mock.split('\n'));
}

function linesFromFile():Observable<string>{
  return new Observable((subscriber) => {
    const fileStream = fs.createReadStream(path.join(__dirname, './inputs/day-2.txt'));
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    let completed = false;
    (async () => {
      for await (const line of rl){
        if(completed) return;
        subscriber.next(line)
      }
    })();
    return () => {
      completed = true;
      subscriber.complete();
      fileStream.close();
    }
  });
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
  linesFromFile()
    .pipe(challenge2)
    .subscribe(x => { console.log(x); })
})();