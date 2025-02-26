export const sleepByPromise = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
