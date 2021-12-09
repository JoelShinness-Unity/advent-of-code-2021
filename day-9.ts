import { from, map, Observable, tap, toArray } from 'rxjs';
import { add, linesFromFile } from './lib';
import _ from 'lodash';

function *neighbors(points:number[][], i:number, j:number):IterableIterator<[number, number, number]>{
  const above = points[i - 1];
  const row = points[i];
  const below = points[i + 1];
  if(above) yield [above[j], i - 1, j];
  if(below) yield [below[j], i + 1, j];
  if(row[j - 1] !== undefined) yield [row[j - 1], i, j - 1];
  if(row[j + 1] !== undefined) yield [row[j + 1], i, j + 1];
}

function isLowest(points:number[][], i:number, j:number):boolean {
  const val = points[i][j];
  for(const [n] of neighbors(points, i, j)){
    if(n < val) return false;
  }
  return true;
}

function *lowestPoints(points:number[][]):IterableIterator<[number, number, number]>{
  for(let i = 0; i < points.length; i++){
    const row = points[i];
    for(let j = 0; j < row.length; j++){
      if(isLowest(points, i, j)) {
        yield [i, j, points[i][j]];
      }
    }
  }
}

function *findBasin(points:number[][], i:number, j:number):IterableIterator<[number, number, number]>{
  const point = points[i][j];
  yield [point, i, j];
  for(const [n, ni, nj] of neighbors(points, i, j)){
    if(n !== 9 && n > point){
      yield *findBasin(points, ni, nj);
    }
  }
}
function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(line => line.split('').map(Number)),
    toArray(),
    map(lines => [...lowestPoints(lines)].map(([,,x]) => x + 1).reduce(add))
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(line => line.split('').map(Number)),
    toArray(),
    map(lines => {
      return [...lowestPoints(lines)].
        map(([i, j]) => {
          return _.uniqWith([...findBasin(lines, i, j)], ([,ai, aj], [,bi,bj]) => ai === bi && aj === bj).length
        })
        .sort((a, b) => b - a)
        .slice(0, 3)
        .reduce((a, b) => a * b)
    }),
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-9.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `2199943210
3987894921
9856789892
8767896789
9899965678`
  return from(mock.split('\n'));
}
