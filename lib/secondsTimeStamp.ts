export function dateToSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function secondsToDate(n: number) {
  return new Date(n * 1000);
}

export function areSecondsEqualToDate(s: number, d: Date) {
    return dateToSeconds(d) === s;
}
