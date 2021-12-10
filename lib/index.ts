import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Observable, reduce } from "rxjs";

export async function *aMap<A,B>(items:AsyncIterable<A>, txfm:(a:A) => Promise<B>|B):AsyncIterableIterator<B>{
  for await(const item of items){
    yield await txfm(item);
  }
}

export function linesFromFile(fileName:string):Observable<string>{
  return new Observable((subscriber) => {
    const fileStream = fs.createReadStream(path.join(__dirname, fileName));
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    let completed = false;
    (async () => {
      for await (const line of rl){
        subscriber.next(line)
      }
      subscriber.complete();
    })();
    return () => {
      completed = true;
      subscriber.complete();
      fileStream.close();
    }
  });

}

export function *withIdx<T>(iterable:Iterable<T>):IterableIterator<[T, number]>{
  let index = 0;
  for(const item of iterable){
    yield [item, index];
    index++;
  }
}

export function add(a:bigint, b:bigint):bigint;
export function add(a:number, b:number):number;
export function add(a, b){
  return a + b;
}

type Cpx = [number, number];
export const cpx = {
  add(first:Cpx, ...vectors:Cpx[]):Cpx{
    return vectors.reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2], first)
  },
  sub(v1:Cpx, v2:Cpx):Cpx{
    return [v1[0] - v2[0], v1[1] - v2[1]];
  },
  mult(first:Cpx, ...vectors:Cpx[]):Cpx{
    return vectors.reduce(([x1, y1], [x2, y2]) => [x1 * x2 - y1 * y2, x1 * y2 + x2 * y1], first);
  },
  mag([x, y]:Cpx):number{
    if(x === 0) { return y; }
    if(y === 0){ return x; }
    return Math.sqrt(x * x + y * y);
  },
  multScalar([x, y]:Cpx, scalar:number):Cpx {
    return [x * scalar, y * scalar];
  },
  normalize(vector:Cpx):Cpx {
    const length = cpx.mag(vector);
    if(length === 0 || length === 1) return vector;
    const [x, y] = vector;
    return [x / length, y / length];
  },
  manhattanNormalize([x, y]:Cpx):Cpx {
    return [
      x === 0 ? 0 : x < 0 ? -1 : 1,
      y === 0 ? 0 : y < 0 ? -1 : 1,
    ]
  },
  div([a, b]:Cpx, [c, d]:Cpx):Cpx {
    const denom = c^c + d^d;
    return [
      (a * c + b * d) / denom,
      (b * c - a * d) / denom
    ]
  }
}

export function *permutations<T>(ts:T[]):IterableIterator<T[]>{
  if(ts.length === 1){
    yield ts;
    return;
  }
  for(let i = 0; i < ts.length; i++){
    let item = ts[i];
    for(const rest of permutations([...ts.slice(0, i), ...ts.slice(i + 1)])){
      yield [item, ...rest];
    }
  }
}

export function *combinations<T>(ts:T[]):IterableIterator<T[]> {
  const limit = 1 << ts.length;
  for(let n = 0; n < limit; n++){
    const output = [];
    for(let i = 0; i < ts.length; i++){
      if((n & (1 << i)) === 0){
        output.push(ts[i]);
      }
    }
    yield output;
  }
}