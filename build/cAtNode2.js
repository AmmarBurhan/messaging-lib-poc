"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageBroker_1 = require("./MessageBroker");
const handlers_1 = require("./handlers");
const interestingTopics = ['wildbreeze.*.*.*'];
function handler1(msg) {
    handlers_1.handler('handler 1', msg, interestingTopics);
}
async function init() {
    const conectionConfiguration = { heartbeat: 5, hostname: handlers_1.url, port: 5673 };
    const consumer1 = await MessageBroker_1.getMessageBroker('abcd', conectionConfiguration);
    consumer1.consume(handlers_1.exchange1, interestingTopics, handler1);
}
init();
