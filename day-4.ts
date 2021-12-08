import produce from 'immer';
import { from, map, Observable, pairwise, scan, skipWhile, switchMap, take } from 'rxjs';
import { linesFromFile, toArray } from './lib';

type Cell = [number, boolean]
type Row = Cell[];
type Card = Row[];

const add = (a, b) => a + b

function checkCard(card:Card):Row|undefined {
  for(let y = 0; y < card.length; y++){
    const row = card[y];
    let allFound = true;
    for(let x = 0; x < row.length; x++){
      const cell = row[x];
      if(!cell[1]){
        allFound = false;
        break;
      }
    }
    if(allFound) return row;
  }
  for(let x = 0; x < card[0].length; x++){
    let allFound = true;
    for(let y = 0; y < card.length; y++){
      const cell = card[y][x];
      if(!cell[1]){
        allFound = false;
        break;
      }
    }
    if(allFound){ return card.map(row => row[x]); }
  }
  return undefined;
}

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    toArray,
    map(([first, ...rest]) => {
      const cards:Card[] = []
      const callNumbers = first.split(',').map(Number);
      while(rest.length){
        const card = []
        rest.shift();
        for(let i = 0; i < 5; i++)
        card.push(rest.shift().trim().split(/\s+/).map(Number).map(n => [n, false]))
        cards.push(card);
      }
      let called = []
      for(const callNumber of callNumbers){
        called.push(callNumber);
        for(const card of cards) {
          for(const row of card){
            for(const cell of row){
              if(cell[0] === callNumber){
                cell[1] = true;
                if(checkCard(card)){
                  return callNumber * card.flatMap(row => row.map(([n]) => n)).filter(n => !called.includes(n)).reduce(add);
                }
              }
            }
          }
        }
      }
      return cards
    })
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
    toArray,
    switchMap(([firstLine, ...rest]) => {
      const cards:Card[] = []
      const callNumbers = firstLine.split(',').map(Number);
      while(rest.length){
        const card = []
        rest.shift();
        for(let i = 0; i < 5; i++)
        card.push(rest.shift().trim().split(/\s+/).map(Number).map(n => [n, false]))
        cards.push(card);
      }
      return from(callNumbers).pipe(
        scan((agg, item) => [item, ...agg], []),
        scan(([finished, remaining], calledNumbers) => {
          const [lastNumber] = calledNumbers;
          const cardResults = remaining.map((card):[Row|undefined, Card] => {
            const newCard = produce(card, draft => {
              for(const row of draft){
                for(const cell of row){
                  if(cell[0] === lastNumber){
                    cell[1] = true;
                    return;
                  }
                }
              }
            });
            return [
              checkCard(newCard),
              newCard
            ]
          });
          return [...cardResults.reduce(([finished, remaining], [result, card]) => {
            if(result) return  [[card, ...finished], remaining];
            return [finished, [...remaining, card]]
          }, [finished, []]), calledNumbers];
        }, [[], cards]),
        pairwise(),
        skipWhile(([, b]) => {
          return (b as any[][])[1].length > 0
        }),
        take(1),
        map(([,[[last],,nums]]) => {
          return last.flatMap(row => row.map(([cell]) => cell).filter(n => !nums.includes(n))).reduce(add) * nums[0]
        }),
      )
    })
  );
}

(() => {
  linesFromMock()
  linesFromFile('../inputs/day-4.txt')
    .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
  8  2 23  4 24
21  9 14 16  7
  6 10  3 18  5
  1 12 20 15 19

  3 15  0  2 22
  9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
  2  0 12  3  7`
  return from(mock.split('\n'));
}
