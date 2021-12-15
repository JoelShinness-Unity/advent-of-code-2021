import {pushSorted} from './index';

describe('pushSorted', () => {
  it('pushes an item to its position', () => {
    const descendingNumberComparator = (a, b) => b - a;

    expect(pushSorted([4,2], descendingNumberComparator, 5)).toEqual([5,4,2])
    expect(pushSorted([4,2], descendingNumberComparator, 1)).toEqual([4,2,1]);
    expect(pushSorted([4,2], descendingNumberComparator, 3)).toEqual([4,3,2]);
  });
  it('pushes an item into the last position it can inhabit', () => {
    type Pair = [number, number];
    const comparator = ([a]:Pair,[b]:Pair) => a - b;
    expect(pushSorted([[1,1],[2,1],[3,1]], comparator, [2,2])).toEqual([[1,1],[2,1],[2,2],[3,1]])
  })
});