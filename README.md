# Advent of Code 2021

Here's how I'm solving the puzzles for this year's [Advent of Code](https://adventofcode.com/2021).

> CAVEAT: 
>
> This is not my usual coding style!  This is very fast coding, very stream-of-consciousness coding.  So there's not many comments, the style changes from day to day or even in the same file, it might not be very readable, there might be code duplication, and it might not be the most efficient code.
>
> I'm also coding in a way that makes sense to me. If I were contributing to a codebase with others, I'd probably be using fewer generator functions and the like for simplicity's sake, but I like &&apos;em for my self, and here we are.
>
> And yes, my `lib/index.ts` is an absolute dog's breakfast that I've just kept adding to.

## Libraries / Languages / Tools used

* TypeScript - Catches my errors and aids auto-complete
* RxJS - FP-ish library for handling collections and async
* immer - Function for creating immutable data
* LoDash - More FP-ish library for collections operations
* nodemon - watches file changes and runs a file

### Stuff in my library:

* Some iterable / async iterable stuff (though not as much as I had before.  Switched to Rx Observables)
* The `add` function, which seems trivial, but I use it with `reduce` alot to add up a list or observable of numbers (or of bigints).  It's an MVP.
* The `cpx` library for complex number operations.  Easy way of doing a bunch of 2d vector operations.
* Permutations and combinations of an array.

### RxJS operators used


* `map<A, B>(txfm:(a:A) => B)` - transforms each entry into something else.
* `filter<T>(pred:(t:T) => boolean)` - only allows entries through that pass a test.
* `reduce<A, B>(reducer:(agg:B, item:A) => B, seed:B)` - gathers all the items together into one final value.  E.g. if I have an Observable of numbers and want the sum, I can call `reduce(add, 0)`.  Easy-peasy.
* `scan<A, B>(reducer:(agg:B, item:A) => B, seed:B)` - a variant of `reduce` that emits the "running total" as each item comes in.  For instance:

```ts
const fromNumbers = from([1, 2, 3]);

fromNumbers.pipe(reduce(add, 0)).subscribe(val => console.log(val));
// CONSOLE: 6

fromNumbers.pipe(scan(add, 0)).subscribe(val => console.log(val));
// CONSOLE: 1
// CONSOLE: 3
// CONSOLE: 6
```

* `tap()` - This is just a debugging step that lets me put a console.log at a given step in the process.  I don't use this as much because I'm usually debugging in real time, but when I get a result that's wrong, I'll go back and look at intermediate results with this.  If you ever have a `tap` in production code, you should probably get rid of it.
* `toArray()` - sometimes the lines can be handled one-at-a-time, and sometimes you need to do honest-to-goodness array operations (like sorting).  This gathers up all the items into an array.  I avoid this where possible because I like lazy evaluation.  Also, this is pretty much equivalent to `reduce<T, T[]>((agg:T[], item:T) => [...agg, item], [])`.

## Heyo!!

I created a script called "heyo" that I've sort of built up as time goes on.  I call it like `yarn heyo 9` where `9` is the day in question.  It does the following:
* If midnight, December 9, 2021, EST is in the future, it waits.  Otherwise it skips.
* It copies the test input into the inputs folder (e.g. `inputs/day-9.txt`)
* It copies the `day-xx.ts` file and formats it for the day.
* It then opens the `day-9.ts` in VS Code and the corresponding puzzle page (`https://adventofcode.com/2021/9`) in the default browser.
* It triggers `nodemon ./day-9.ts`, listening for changes and spitting the output to the terminal.

I call that script in the few minutes before the challenge and watch it run.