import { from, map, Observable, scan, toArray } from 'rxjs';


function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    map(x => x.split('').map(x => x === "1" ? [0, 1] : [1, 0])),
    scan((agg, line) => {
      return line.map(([z, o], i) => {
        const [az, ao] = agg[i];
        return [az + z, ao + o]
      })
    }, [...new Array(12)].map(() => [0, 0])),
    map(aggs => {
      let gamma = 0;
      let epsilon = 0;
      aggs.forEach(([z, o], i) => {
        gamma <<= 1;
        epsilon <<= 1;
        if(z > o){
          gamma++
        } else {
          epsilon++
        }
      })
      return gamma * epsilon
    })
  )
}
function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    toArray(),
    map(arr => {
      let o2 = arr;
      let co2 = arr;

      for(let i = 0; o2.length > 1; i++){
        const [a, b] = o2.reduce(([a, b], item) => item[i] === "0" ? [[...a, item], b] : [a, [...b, item]], [[], []])
        o2 = a.length > b.length ? a : b;
      }
      for(let i = 0; co2.length > 1; i++){
        const [a, b] = co2.reduce(([a, b], item) => item[i] === "0" ? [[...a, item], b] : [a, [...b, item]], [[], []])
        co2 = b.length < a.length ? b : a
      }
      return [o2, co2];
    }),
    // flatMap((arr) => {

    //   return range(0, Infinity).pipe(
    //     scan(([o2, co2], i) => {
    //       let newO2 = o2;
    //       let newCo2 = co2;
    //       if(newO2.length !== 1){
    //         const [o2a, o2b] = o2.reduce(([a, b], line) => line[i] === "0" ? [[...a, line], b] : [a, [...b, line]], [[],[]]);
    //         newO2 = o2a.length > o2b.length ? o2a : o2b;
    //       }
    //       if(newCo2.length !== 1){
    //         const [co2a, co2b] = co2.reduce(([a, b], line) => line[i] === "0" ? [[...a, line], b] : [a, [...b, line]], [[],[]]);
    //         newCo2 = co2a.length <= co2b.length ? co2a : co2b
    //       }
          
    //       return [
    //         newO2,
    //         newCo2
    //       ]
    //     }, [arr, arr]),
    //     skipWhile(([a, b]) => a.length > 1 || b.length > 1),
    //     take(1)
    //   )
    // }),
    map(([[a], [b]]) => parseInt(a, 2) * parseInt(b, 2))
  )
}

(() => {
  // linesFromFile('./inputs/day-3.txt')
  linesFromMock().pipe(challenge2)
    .subscribe(x => { console.log(x); })
})();

function linesFromMock():Observable<string>{
  const mock = `00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`
  return from(mock.split('\n'));
}
