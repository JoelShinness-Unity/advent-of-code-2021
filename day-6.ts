import { concatMap, from, map, Observable, range, scan, skip, skipWhile, take, tap } from 'rxjs';
import { linesFromFile } from './lib';

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map((line) => line.split(',').map(Number)),
    concatMap((initial) => {
      return range(1, Infinity).pipe(
        scan<number, [number, number[]]>(([, set], agg) => {
          let newOnes = 0;
          const existing = [];
          for(let num of set){
            if(num == 0){
              existing.push(6);
              newOnes++;
            } else {
              existing.push(num - 1)
            }
          }
          for(let i = 0; i < newOnes;i++){
            existing.push(8);
          }
          return [agg, existing]
        }, [0, initial])
      )
    }),
    map(([n, set]) => [n, set.length]),
    tap(([n, set]) => {
      if(n % 10 === 0){
        console.log(n, set);
      }
    }),
    skipWhile(([n]) => n < 256),
    take(1)
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map((line) => line.split(',').map(Number)),
    concatMap((initial) => {
      const firstHash = new Map<number, bigint>();
      for(const num of initial){
        firstHash.set(num, (firstHash.get(num) || BigInt(0)) + BigInt(1))

      }
      
      return range(1, Infinity).pipe(
        scan<number, [number, Map<number, bigint>]>(([, set], num) => {
          const newMap = new Map<number, bigint>();
          set.forEach((val, key) => {
            if(key === 0){
              newMap.set(6, (newMap.get(6) || BigInt(0)) + val);
              newMap.set(8, (newMap.get(8) || BigInt(0)) + val);
            } else {
              newMap.set(key - 1, (newMap.get(key - 1) || BigInt(0)) + val);
            }
          })
          return [num, newMap];
        }, [0, firstHash])
      )
    }),
    // skip(79),
    skip(255),
    take(1),
    map(([n, set]) => [...set.entries()].reduce((agg, [key, val]) => agg + val, BigInt(0)))
    // map(([n, set]) => [n, Object.values(set).reduce((a,  b) => a + b, 0)])
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-6.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `3,4,3,1,2`
  return from(mock.split('\n'));
}
