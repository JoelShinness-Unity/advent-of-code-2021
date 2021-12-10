import { from, map, Observable, reduce } from 'rxjs';
import { add, linesFromFile, permutations } from './lib';
import _ from 'lodash'

function challenge1(lines:Observable<string>):Observable<unknown>{
  const easyLengths = [2, 3, 4, 7]
  return lines.pipe(
    map(line => line.split('|').map(l => l.trim().split(/\s+/))),
    map(([,numbers]) => {
      return numbers.filter(n => easyLengths.includes(n.length)).length
    }),
    reduce(add, 0)
  );
}

function union(str1: string, str2: string){
  return [...str1].filter(seg => str2.includes(seg)).join('');
}
function match(str1: string, str2:string){
  if(str1.length !== str2.length) return false;
  return [...str1].sort().join('') === [...str2].sort().join('')
}
function contains(big:string, little:string){
  return [...little].every(seg => big.includes(seg));
}
function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(line => line.split('|').map(l => l.trim().split(/\s+/))),
    map(([codes, numbers]) => {
      const sortedCodes = codes.sort((a, b) => a.length - b.length);
      const [one, seven, four,,,,,,,eight] = sortedCodes;
      const fiveSeg = sortedCodes.slice(3, 6);
      const sixSeg = sortedCodes.slice(6, 9);
      const isSix = (seg) => !contains(seg, one);
      const isNine = (seg) => contains(seg, four);
      const [six, nine, zero] = (() => {
        for(const [a, b, c] of permutations(sixSeg)){
          if(isSix(a) && isNine(b)){
            return [a, b, c];
          }
        }
      })();
      const isThree = (seg) => contains(seg, one);
      const isTwo = (seg) => union(seg, four).length == 2;
      const [three, two, five] = (() => {
        for(const [a, b, c] of permutations(fiveSeg)){
          if(isThree(a) && isTwo(b)){
            return [a, b, c];
          }
        }
      })()
      const foundNums = [zero, one, two, three, four, five, six, seven, eight, nine];
      const code = numbers.map(n => foundNums.findIndex(num => match(n, num)));
      return Number(code.join(''))
    }),
    reduce(add, 0)
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-8.txt')
    // .pipe(challenge1)
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce`
  return from(mock.split('\n'));
}
