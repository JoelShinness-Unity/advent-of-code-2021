import { reduce, filter, from, map, Observable, toArray } from 'rxjs';
import _ from 'lodash';
import { add, linesFromFile } from './lib';

const starts = "([{<";
const ends = ")]}>";
const valTable = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137
}

const incompleteValTable = {
  "(": 1,
  "[": 2,
  "{": 3,
  "<": 4
};

type Code = "COMPLETE" | "INCOMPLETE" | "ERROR"
function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map((line):[Code, string, string?] => {
      const currents = [];
      for(const char of line){
        if(starts.includes(char)){
          currents.unshift(char);
          continue;
        } else {
          const i = ends.indexOf(char);
          const last = currents.shift();
          if(starts.indexOf(last) !== i){
            return ["ERROR", line, char];
          }
        }
      }
      if(currents.length){
        return ["INCOMPLETE", line];
      }
      return ["COMPLETE", line];
    }),
    filter(([code]) => code === "ERROR"),
    map(([,,chars]) => valTable[chars]),
    reduce(add, 0)
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map((line):[Code, string, string?] => {
      const currents = [];
      for(const char of line){
        if(starts.includes(char)){
          currents.unshift(char);
          continue;
        } else {
          const i = ends.indexOf(char);
          const last = currents.shift();
          if(starts.indexOf(last) !== i){
            return ["ERROR", line, char];
          }
        }
      }
      if(currents.length){
        return ["INCOMPLETE", line, currents.join('')];
      }
      return ["COMPLETE", line];
    }),
    filter(([code]) => code === "INCOMPLETE"),
    map(([,,remaining]) => {
      return remaining
        .split('')
        .map(char => incompleteValTable[char])
        .reduce((agg, val) => agg * 5 + val, 0)
    }),
    toArray(),
    map(lines => {
      const sorted = lines.sort((a, b) => a - b);
      return sorted[Math.floor(lines.length / 2)]
    })
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-10.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`
  return from(mock.split('\n'));
}
