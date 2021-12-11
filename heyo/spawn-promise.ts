import { spawn, SpawnOptionsWithoutStdio } from "child_process";

export async function spawnPromise(cmd:string, args?:readonly string[], options?:SpawnOptionsWithoutStdio){
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('error', reject);
    child.on('close', resolve);
    child.on('exit', resolve);
    child.on('disconnect', resolve);
  });
}