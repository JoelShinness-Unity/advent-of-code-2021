import { from, map, Observable, toArray } from 'rxjs';
import _ from 'lodash';
import { linesFromFile, pushSorted } from './lib/index';

function neighbors(grid:number[][], y:number, x:number, inputRisk:number):[number, number, number][]{
  const output = []
  if(grid[y - 1]) output.push([y - 1, x, grid[y - 1][x] + inputRisk]);
  if(grid[y + 1]) output.push([y + 1, x, grid[y + 1][x] + inputRisk]);
  if(grid[y][x - 1]) output.push([y, x - 1, grid[y][x - 1] + inputRisk]);
  if(grid[y][x + 1]) output.push([y, x + 1, grid[y][x + 1] + inputRisk]);
  return output.sort(([,,a], [,,b]) => a - b);
}

function calculate(total:number[][]){
  const visited = new Map<string, number>();
  let paths = [[0,0,0]];
  const height = total.length;
  const width = total[0].length;
  const totalCells = height * width;
  while(paths.length){
    const [y,x,risk] = paths.shift();
    const coord = `${y},${x}`;
    if(visited.has(coord)) continue;
    if(y === height - 1 && x === width - 1){
      return risk;
    }
    visited.set(coord, risk);
    for(const neighbor of neighbors(total, y, x, risk)){
      if(!visited.has(`${neighbor[0]},${neighbor[1]}`)){
        paths = pushSorted(paths, ([ax,ay,ar],[bx,by,br]) => {
          if(ar === br) {
            return (ax + ay) - (bx + by)
          }
          return ar - br
        }, neighbor)
      }
    }
    console.log('Visited', visited.size / totalCells)
  }
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    toArray(),
    map(total => total.map(x => x.split('').map(Number))),
    map(calculate)
  );
}

function advanceLine(line:number[], n:number){
  return line.map(x => {
    const newNum = x + n;
    if(newNum <= 9) return newNum;
    return newNum - 9
  })
}
function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    toArray(),
    map(total => total.map(line => line.split('').map(Number))),
    map((total):number[][] => {
      const start = total.map(line => {
        return _.range(1, 5).reduce((agg, n) => {
          return agg.concat(advanceLine(line, n));
        }, line)
      })
      return _.range(1, 5).reduce((agg, n) => {
        return agg.concat(start.map(line => advanceLine(line, n)))
      }, start)
    }),
    map(calculate)
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-15.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`
  return from(mock.split('\n'));
}
