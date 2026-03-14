import { MESSAGE_ROLE } from "./constants";

export type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];
