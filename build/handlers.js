"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceHandler = exports.url = exports.handler = exports.exchange2 = exports.exchange1 = void 0;
function handler(handlerName, msg, topics) {
    const message = msg.content;
    const topic = msg.fields.routingKey;
    console.log(`${msg.fields.exchange}: ${topics}`);
    console.log(`${handlerName}:\ntopic: ${topic}`);
    console.log('content:', message);
    console.log();
}
exports.handler = handler;
function traceHandler(handlerName, msg, topics) {
    const message = msg.content;
    const topic = msg.fields.routingKey;
    console.log('****** TRACING START ******');
    console.log(`${handlerName}:\ntopic: ${topic}`);
    console.log('Node:', msg.properties.headers.node);
    console.log('content:', message);
    console.log('****** TRACING END******\n');
}
exports.traceHandler = traceHandler;
const exchange1 = 'highFive_exchange';
exports.exchange1 = exchange1;
const exchange2 = 'users_exchange';
exports.exchange2 = exchange2;
const url = 'localhost';
exports.url = url;
