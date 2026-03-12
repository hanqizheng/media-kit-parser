import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const generate = customAlphabet(alphabet, 16);

export function createId(prefix: "s" | "m" | "t" | "p"): string {
  return `${prefix}_${generate()}`;
}

export function sessionId(): string {
  return createId("s");
}

export function messageId(): string {
  return createId("m");
}

export function turnId(): string {
  return createId("t");
}

export function partId(): string {
  return createId("p");
}
