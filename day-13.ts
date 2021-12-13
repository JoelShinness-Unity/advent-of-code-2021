import { from, map, Observable, reduce } from 'rxjs';
import _ from 'lodash';
import { Cpx, linesFromFile } from './lib';
import produce from 'immer';
type Axis = 'x'|'y';
type Fold = [Axis, number]
type State = {
  field: Cpx[]
  folds: Fold[]
}

function fold(field:Cpx[], [axis, mark]:Fold):Cpx[]{
  const axisIndex = ["x", "y"].indexOf(axis);
  return _.uniqWith(produce(field, draft => {
    for(const point of draft){
      if(point[axisIndex] <  mark) continue;
      point[axisIndex] = mark * 2 - point[axisIndex];
    }
  }), _.isEqual);
}

function makeStateReducer(agg:State, line:string):State {
  if(/^\d+,\d+$/.test(line)){
    return produce(agg, draft => {
      draft.field.push(line.split(',').map(Number) as Cpx);
    })
  } else {
    const check = /^fold along (x|y)=(\d+)/.exec(line);
    if(check){
      return produce(agg, draft => {
        draft.folds.push([check[1] as Axis, Number(check[2])])
      })  
    }
  }
  return agg;
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    reduce(makeStateReducer, {field:[], folds:[]}),
    map(({field, folds:[firstFold]}) => {
      return fold(field, firstFold);
    }),
    map(field => field.length)
  );
}
function print(field:Cpx[]){
  const output:string[] = [];
  for(const [x, y] of field){
    while(output.length <= y){
      output.push("".padEnd(x, " "));
    }
    if(output[y].length <= x){
      output[y] = output[y].padEnd(x, " ")
    }
    output[y] = output[y].substring(0, x) + "#" + output[y].substring(x + 1)
  }
  return output.join('\n')
}
function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    reduce(makeStateReducer, {field:[], folds:[]}),
    map(({field, folds}) => {
      return folds.reduce(fold, field);
    }),
    map(print)
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-13.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`
  return from(mock.split('\n'));
}
