import { from, map, Observable, reduce, scan } from 'rxjs';
import _, { filter } from 'lodash';
import produce from 'immer';
import { linesFromFile } from './lib';

function isUppercase(str:string){
  return str === str.toUpperCase();
}
function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    reduce<string, Record<string, string[]>>((agg, line) => {
      const [from, to] = line.split('-');
      return produce(agg, draft => {
        if(to !== "start" && from !== "end"){
          if(draft[from] === undefined){
            draft[from] = [];
          }
          draft[from].push(to);  
        }
        if(from !== "start" && to !== "end"){
          if(draft[to] === undefined){
            draft[to] = [];
          }
          draft[to].push(from)  
        }
      })
    }, {}),
    map((system) => {
      const completedPaths = [];
      const paths = [['start']];
      while(paths.length){
        const [first, ...rest] = paths.shift();
        const nextOnes = system[first] || [];
        for(const next of nextOnes){
          if(next === 'end'){
            completedPaths.push([next, first, ...rest].reverse());
            paths.push([next, first, ...rest]);
          } else if(isUppercase(next) || !rest.includes(next)) {
            paths.push([next, first, ...rest]);
          }
        }
      }
      return completedPaths.length;
    })
  );
}

function goodJourney(journey:string[]):boolean{
  let oneExtra:string|undefined;
  let smalls = new Set<string>();
  for(const cave of journey){
    if(isUppercase(cave)) continue;
    if(!smalls.has(cave)){
      smalls.add(cave);
      continue;
    }
    if(oneExtra === undefined){
      oneExtra = cave;
      continue;
    }
    return false;
  }
  return true;
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    reduce<string, Record<string, string[]>>((agg, line) => {
      const [from, to] = line.split('-');
      return produce(agg, draft => {
        if(to !== "start" && from !== "end"){
          if(draft[from] === undefined){
            draft[from] = [];
          }
          draft[from].push(to);  
        }
        if(from !== "start" && to !== "end"){
          if(draft[to] === undefined){
            draft[to] = [];
          }
          draft[to].push(from)  
        }
      })
    }, {}),
    map((system) => {
      const paths = [["start"]];
      let completedPaths = []
      while(paths.length){
        const [first, ...rest] = paths.shift();
        for(const nextSpot of system[first]){
          const nextJourney = [nextSpot, first, ...rest];
          if(nextSpot === "end"){
            completedPaths.push([...rest.reverse(), first, nextSpot].join(','))
          } else if(goodJourney(nextJourney)) {
            paths.push(nextJourney);
          }
        }
        console.log(paths);
      }
      return completedPaths.length;
    })
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-12.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `start-A
start-b
A-c
A-b
b-d
A-end
b-end`
  return from(mock.split('\n'));
}
