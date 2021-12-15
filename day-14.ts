import { concatMap, from, map, Observable, pairs, range, scan, skip, take, tap, toArray } from 'rxjs';
import _ from 'lodash';
import { incCountMap, linesFromFile } from './lib';
import produce from 'immer';

type Rule = [string, string]
type Rule2 = [string, string[]]

function *buddy<T>(ts:T[], n:number):IterableIterator<T[]>{
  if(ts.length < n) return;
  for(let i = 0; i <= ts.length - n; i++){
    yield ts.slice(i, i + n);
  }
}
function advance(template:string, rules:Rule[]){
  let newTemplate = template;
  for(let i = 0; i < newTemplate.length; i++){
    const pair = newTemplate.substring(i, i + 2);
    for(let rule of rules){
      if(rule[0] === pair){
        newTemplate = newTemplate.substring(0, i) + rule[1] + newTemplate.substring(i + 2);
        i++
      }
    }
  }
  return newTemplate;
}

function advance2(template:Record<string, bigint>, rules:Rule2[]){
  return produce(template, draft => {
    for(const [pair, [match1, match2]] of rules){
      if(template[pair]){
        incCountMap(draft, match1, template[pair]);
        incCountMap(draft, match2, template[pair]);
        incCountMap(draft, pair, -template[pair]);
      }
    }
  })
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  let count = 0;
  let last = new Date();
  return lines.pipe(
    toArray(),
    map(([template, , ...rules]) => {
      return [template, rules.map(rule => {
        const results = /^([A-Z]{2}) -> ([A-Z])$/.exec(rule);
        const first = results[1];
        const next = first[0]  + results[2] + first[1];
        return [first, next]
      })] as [string, Rule[]]
    }),
    concatMap(([template, rules]) => {
      return range(1, Infinity).pipe(
        scan((agg) => advance(agg, rules), template)
      )
    }),
    tap(() => { 
      let next = new Date()
      console.log('Advancing', count++, +next - +last);
      last = next;
    }),
    skip(9),
    take(1),
    map(x => {
      const counts:Record<string, bigint> = {};
      for(const letter of x){
        counts[letter] = (counts[letter] || BigInt(0)) + BigInt(1)
      }
      const [first, ...rest] = Object.entries(counts);

      const [[,min], [,max]] = rest.reduce(([[minLetter, minCount], [maxLetter, maxCount]], [letter, count]) => {
        return [
          count < minCount ? [letter, count] : [minLetter, minCount],
          count > maxCount ? [letter, count] : [maxLetter, maxCount]
        ]
      }, [first, first]);
      return max - min;
    })
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  let count = 0;
  let last = new Date();
  let letters = ""
  return lines.pipe(
    toArray(),
    map(([template, , ...rules]) => {
      letters += template[0];
      letters += template[template.length - 1]
      return [
        [...buddy(template.split(''), 2)]
          .map(x => x.join(''))
          .reduce((agg, pair):Record<string, bigint> => produce(agg, draft => {
            incCountMap(draft, pair);
          }), {}),
        rules.map((rule):Rule2 => {
        const results = /^([A-Z]{2}) -> ([A-Z])$/.exec(rule);
        const first = results[1];

        return [first, [first[0] + results[2], results[2] + first[1]]];
      })] as [Record<string, bigint>, Rule2[]]
    }),
    concatMap(([template, rules]) => {      
      console.log(template)
      return range(1, Infinity).pipe(
        scan((agg) => {
          return advance2(agg, rules);
        }, template)
      );
    }),
    skip(39),
    take(1),
    map((x) => {
      const augmentedTemplate = produce(x, draft => {
        incCountMap(draft, letters);
      })
      const toSingleLetters = {};
      for(const key in augmentedTemplate){
        for(const letter of key){
          incCountMap(toSingleLetters, letter, augmentedTemplate[key]);
        }
      }
      const [first, ...rest] = Object.values(toSingleLetters);
      const [min, max] = rest.reduce(([min, max], val) => {
        const realVal = val / BigInt(2)
        return [
          realVal < min ? realVal : min,
          realVal > max ? realVal : max
        ]
      }, [first, first])
      return max - min
    }),
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-14.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`
  return from(mock.split('\n'));
}
