import { BaseMessage } from "./types";
export default function getRandomIntInclusive(min: number, max: number): number;
export declare const messages: Array<BaseMessage>;
export declare const messages2: Array<BaseMessage>;
export declare const routes1: Array<string>;
export declare const routes2: Array<string>;
export declare function getRandomMessage(source: Array<BaseMessage>): BaseMessage;
export declare function getRandomRoute(source: Array<string>): string;
export declare function delay(n: number): Promise<unknown>;
