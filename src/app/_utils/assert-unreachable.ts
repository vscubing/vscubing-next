// https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript/39419171#39419171
export function assertUnreachable(_: never) {
  throw new Error("Didn't expect to get here")
}
