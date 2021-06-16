import { ConsumeMessage } from './MessageBroker';
declare function handler(handlerName: string, msg: ConsumeMessage, topics: Array<string>): void;
declare function traceHandler(handlerName: string, msg: ConsumeMessage, topics: Array<string>): void;
declare const exchange1 = "highFive_exchange";
declare const exchange2 = "users_exchange";
declare const url = "localhost";
export { exchange1, exchange2, handler, url, traceHandler };
