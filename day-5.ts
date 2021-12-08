import produce from 'immer';
import { filter, from, map, Observable, scan, take, takeLast, tap } from 'rxjs';
import { linesFromFile } from './lib';


function *iterate([x1, y1], [x2, y2]){
  const diff = [
    x2 > x1 ? 1 : x2 === x1 ? 0 : -1,
    y2 > y1 ? 1 : y2 === y1 ? 0 : -1
  ]
  for(let point = [x1, y1]; point[0] !== x2 && point[1] !== y2; point = [point[0] + diff[0], point[1] + diff[1]]){
    yield point;
  }
  yield [x2, y2];
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  
  return lines.pipe(
    map((line) => line.split(' -> ').map(coord => coord.split(',').map(Number))),
    scan((agg, [[x1, y1], [x2, y2]]) => {
      return produce(agg, draft => {
        for(const [x, y] of iterate([x1, y1], [x2, y2])) {
          draft[`${x},${y}`] = (draft[`${x},${y}`]|0) + 1;
        }
      });
    }, {}),
    // takeLast(1),
    scan(([n], item) => [n + 1, item], [0]),
    tap(([n, agg]:[number, {}]) => {
      if(n % 20 === 0){
        console.log(n, Object.values(agg).filter(n => n > 1).length)
      }
    }),
    map(([,item]) => item),
    takeLast(1),
    map(agg => {
      return Object.values(agg).filter(n => n > 1).length
    }),
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
  );
}

(() => {
  linesFromMock()
  // linesFromFile('../inputs/day-5.txt')
    .pipe(challenge1)
    // .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`
  return from(mock.split('\n'));
}
