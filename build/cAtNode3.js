"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageBroker_1 = require("./MessageBroker");
const handlers_1 = require("./handlers");
function handler2(msg) {
    handlers_1.handler('handler 2', msg, interestingTopics);
}
const interestingTopics = ['wildbreeze.*.*.*'];
async function init() {
    const conectionConfiguration = { heartbeat: 5, hostname: handlers_1.url, port: 5674 };
    const consumer2 = await MessageBroker_1.getMessageBroker('abcd', conectionConfiguration);
    consumer2.consume(handlers_1.exchange1, interestingTopics, handler2);
}
init();
