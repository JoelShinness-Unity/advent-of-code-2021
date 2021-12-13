import { from, Observable } from 'rxjs';
import _ from 'lodash';
import { linesFromFile } from './lib';

function challenge1(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
  );
}

function challenge2(lines:Observable<string>):Observable<unknown>{
  return lines.pipe(
  );
}

(() => {
  linesFromMock()
  // linesFromFile('../inputs/day-xx.txt')
    .pipe(challenge1)
    // .pipe(challenge2)
    .subscribe(console.log.bind(console))
})();

function linesFromMock():Observable<string>{
  const mock = `Mock Data Here`
  return from(mock.split('\n'));
}
