export function randomTimeout(maxMilliseconds = 1000) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, Math.floor(Math.random() * maxMilliseconds));
      });
}