import fs from 'fs';
import produce, {Draft, enableMapSet} from 'immer';
import path from 'path';
import readline from 'readline';
import { Observable } from "rxjs";
import * as I from 'immutable';
import _ from 'lodash';

enableMapSet();

export async function *aMap<A,B>(items:AsyncIterable<A>, txfm:(a:A) => Promise<B>|B):AsyncIterableIterator<B>{
  for await(const item of items){
    yield await txfm(item);
  }
}

export function reduceIter<A,B>(as:Iterable<A>, reducer:(b:B, a:A, i:number) => B,seed:B){
  let current:B = seed;
  let index = 0;
  for(const a of as){
    current = reducer(current, a, index++);
  }
  return current;
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

export type Cpx = [number, number];
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

export function *buddy<T>(ts:T[], n:number):IterableIterator<T[]>{
  if(ts.length < n) return;
  for(let i = 0; i <= ts.length - n; i++){
    yield ts.slice(i, i + n);
  }
}

/**
 * These next two deal with having a hash of strings with counts.
 */
export type CountMap<T extends string|number|symbol> = Record<T, bigint>;
export function incCountMap<T extends string|number|symbol = string>(map:CountMap<T>, key:T, by:bigint = BigInt(1)){
  if(by === BigInt(0)) return;
  if(!map[key]) {
    map[key] = by;
    return;
  }
  map[key] += by;
  if(map[key] === BigInt(0)){
    delete map[key];
  }
}

export function mergeCountMaps<T extends string|number|symbol = string>(a:CountMap<T>, b:CountMap<T>){
  for(const key in b){
    incCountMap(a, key, b[key]);
  }
}

export function incImmCountMap<K>(map:I.Map<K,bigint>, key:K, by:bigint = BigInt(1)):I.Map<K, bigint>{
  if(by === BigInt(0)) return map;
  for(const existingKey of map.keys()){
    if(_.isEqual(key, existingKey)){
      const currentVal = map.get(existingKey);
      const newVal = currentVal + by;
      if(newVal === BigInt(0)) return map.delete(existingKey);
      return map.set(existingKey, newVal);
    }
  }
  return map.set(key, by);
}

export function mergeImmCountMap<K>(a:I.Map<K,bigint>, b:I.Map<K, bigint>):I.Map<K,bigint> {
  return reduceIter(a.entries(), (agg, [key, val]) => incImmCountMap(agg, key, val), b);
}

export function pushSorted<T>(agg:T[], comparator:(a:T,b:T) => number, item:T):T[]{
  for(let i = agg.length - 1; i >= 0; i--){
    if(comparator(agg[i], item) <= 0){
      const x = agg.slice(0, i + 1);
      x.push(item, ...agg.slice(i + 1))
      return x
    }
  }
  return [item, ...agg];
}