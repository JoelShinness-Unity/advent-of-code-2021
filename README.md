# Advent of Code 2021

Here's how I'm solving the puzzles for this year's [Advent of Code](https://adventofcode.com/2021).

> CAVEAT: 
>
> This is not my usual coding style!  This is very fast coding, very stream-of-consciousness coding.  So there's not many comments, the style changes from day to day or even in the same file, it might not be very readable, and it might not be the most efficient code.
>
> Also, my lib/index.ts is an absolute dog's breakfast that I've just kept adding to.

## Libraries / Languages / Tools used

* TypeScript - Catches my errors and aids auto-complete
* RxJS - FP-ish library for handling collections and async
* immer - Function for creating immutable data
* LoDash - More FP-ish library for collections operations
* nodemon - watches file changes and runs a file

## Heyo!!

I created a script called "heyo" that I've sort of built up as time goes on.  I call it like `yarn heyo 9` where `9` is the day in question.  It does the following:
* If day 9 is in the future, it waits for day 9.  Otherwise it skips
* It copies the test input into the inputs folder (e.g. `inputs/day-9.txt`)
* It copies the `day-xx.ts` file and formats it for the day.

I call that script in the few minutes before the challenge and watch it run.