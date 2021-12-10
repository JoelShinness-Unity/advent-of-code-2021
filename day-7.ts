import { from, map, Observable } from 'rxjs';
import { add, linesFromFile } from './lib';

function triangularNumber(n:number){
  return (n * (n + 1)) / 2
}
function diff(nums:number[], point:number):number {
  return nums.map(n => triangularNumber(Math.abs(n - point))).reduce(add)
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(x => x.split(',').map(Number)),
    map((nums) => {
      let [min, max] = nums.reduce(([min, max], n) => [Math.min(min, n), Math.max(max, n)], [nums[0], nums[0]]);
      console.log(min, max)
      function bestHalf(min:number, max:number):number {
        if(min === max){
          return diff(nums, min);
        }
        if(min + 1 === max){
          return Math.min(diff(nums, min), diff(nums, max))
        }
        const half = Math.floor((min + max) / 2);
        console.log(min, half, max)
        return Math.min(bestHalf(min, half), bestHalf(half, max));
      }
      return bestHalf(min, max)
    })
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
  );
}

(() => {
  // linesFromMock()
  linesFromFile('../inputs/day-7.txt')
    .pipe(challenge1)
    // .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `16,1,2,0,4,2,7,1,2,14`
  return from(mock.split('\n'));
}
