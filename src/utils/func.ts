export const inspect =
  (name: string) =>
  <T>(x: T) => {
    console.debug(`${name}: ${JSON.stringify(x)}`);
    return x;
  };
