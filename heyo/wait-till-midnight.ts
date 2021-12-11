import momentTz from 'moment-timezone';

export async function waitTillMidnight(day:string){
  const upcoming = +momentTz.tz(`2021-12-${day.padStart(2, "0")}`, "America/New_York").toDate();

  while(true){
    const secondsDiv = 1000;
    const minutesDiv = 60 * secondsDiv;
    const hoursDiv = 60 * minutesDiv;
  
    const next = upcoming - +(new Date());
    if(next <= 0) break;
    process.stdout.cursorTo(0);
    process.stdout.clearLine(0);
    const seconds = `${Math.floor(next / secondsDiv) % 60}`.padStart(2, '0');
    const minutes = `${Math.floor(next / minutesDiv) % 60}`.padStart(2, '0');
    const hours = `${Math.floor(next / hoursDiv)}`.padStart(2, '0')
    process.stdout.write(`Starting in ${hours}:${minutes}:${seconds}`)
    await new Promise(r => setTimeout(r, 1000 / 12));
  }
  process.stdout.cursorTo(0);
  process.stdout.clearLine(0);
}