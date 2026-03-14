import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const generate = customAlphabet(alphabet, 16);

export function createId(prefix: "s" | "m" | "t" | "p"): string {
  return `${prefix}_${generate()}`;
}

export function genSessionId(): string {
  return createId("s");
}

export function genMessageId(): string {
  return createId("m");
}

export function genTurnId(): string {
  return createId("t");
}

export function genPartId(): string {
  return createId("p");
}
