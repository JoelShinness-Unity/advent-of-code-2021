import { concatMap, from, map, Observable, range, scan, skipWhile, startWith, take, takeLast, toArray } from 'rxjs';

import _, { takeWhile } from 'lodash';
import produce from 'immer';
import { Cpx, linesFromFile, withIdx } from './lib';

type Grid = Row[];
type Row = number[];
function *neighbors(grid:Grid, i:number, j:number):IterableIterator<[number, number]>{
  const rowAbove = grid[i - 1];
  if(rowAbove){
    if(rowAbove[j - 1] !== undefined) yield [i - 1, j - 1];
    yield [i - 1, j];
    if(rowAbove[j + 1] !== undefined) yield [i - 1, j + 1];
  }
  if(grid[i][j - 1] !== undefined) yield [i, j - 1];
  if(grid[i][j + 1] !== undefined) yield [i, j + 1];
  const rowBelow = grid[i + 1];
  if(rowBelow){
    if(rowBelow[j - 1] !== undefined) yield [i + 1, j - 1];
    yield [i + 1, j];
    if(rowBelow[j + 1] !== undefined) yield [i + 1, j + 1];
  }
}
function advance(grid:Grid):[Grid, number]{
  return produce([grid, -1], draft => {
    const flashes = new Set<string>();
    for(const row of draft[0]){
      for(let j = 0; j < row.length; j++){
        row[j]++
      }
    }
    while(flashes.size > draft[1]){
      draft[1] = flashes.size;
      for(const [row, i] of withIdx(draft[0])){
        for(let j = 0; j < row.length; j++){
          if(!flashes.has(`${i},${j}`) && row[j] > 9){
            flashes.add(`${i},${j}`);
            for(const [ni, nj] of neighbors(draft[0], i, j)){
              draft[0][ni][nj]++;
            }
          }
        }
      }
    }
    for(const item of flashes){
      const [i, j] = item.split(',').map(Number);
      draft[0][i][j] = 0;
    }
  })

}
function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(x => x.split('').map(Number)),
    toArray(),
    concatMap((grid:Grid):Observable<[Grid, number]> => {
      return range(1, 100).pipe(
        scan<number, [Grid, number]>(([grid, flashesCount]) => {
          const [newGrid, newFlashes] = advance(grid);
          return [newGrid, newFlashes + flashesCount]
        }, [grid, 0]),
        startWith<[Grid, number]>([grid, 0])
      );
    }),
    map(([, count]) => count),
    takeLast(1)
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(x => x.split('').map(Number)),
    toArray(),
    concatMap((grid:Grid) => {
      return range(1, Infinity).pipe(
        scan<number, [Grid, number]>(([grid], n) => {
          const [newGrid] = advance(grid);
          return [newGrid, n]
        }, [grid, 0]),
      )
    }),
    skipWhile(([grid]) => grid.some(row => row.some(cell => cell > 0))),
    take(1),
    map(([, count]) => count)
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-11.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`
  return from(mock.split('\n'));
}
