"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageBroker_1 = require("./MessageBroker");
const handlers_1 = require("./handlers");
function handler2(msg) {
    handlers_1.traceHandler('Tracing Handler', msg, interestingTopics);
}
const interestingTopics = ['wildbreeze.*.*.*'];
async function init() {
    const conectionConfiguration1 = { heartbeat: 5, hostname: handlers_1.url, port: 5674 };
    const messageTracer1 = await MessageBroker_1.getMessageTracer(conectionConfiguration1);
    messageTracer1.trace(handler2);
}
init();
