"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageBroker_1 = require("./MessageBroker");
const handlers_1 = require("./handlers");
const helper_1 = require("./helper");
async function init() {
    let publishTimer;
    let broadcastTimer;
    const conectionConfiguration1 = { heartbeat: 5, hostname: handlers_1.url, port: 5673 };
    const producer1 = await MessageBroker_1.getMessageBroker('abcd', conectionConfiguration1);
    producer1.createExchange(handlers_1.exchange1);
    publishTimer = setInterval(async () => {
        if (producer1.isConnected) {
            const route = helper_1.getRandomRoute(helper_1.routes1);
            const message = helper_1.getRandomMessage(helper_1.messages);
            const nodeRecieved = await producer1.publishMessage(route, message);
            if (nodeRecieved)
                console.log('sent\nmessage:', message, '\nwith topic of: ', route, '\n');
        }
        else
            console.log('not connected');
    }, 5000);
    broadcastTimer = setInterval(async () => {
        if (producer1.isConnected) {
            const message = helper_1.getRandomMessage(helper_1.messages);
            const nodeRecieved = await producer1.broadcast(message);
            if (nodeRecieved)
                console.log('broadcast\nmessage:', message, '\n');
        }
        else
            console.log('not connected');
    }, 7000);
    setTimeout(() => {
        clearInterval(broadcastTimer);
        clearInterval(publishTimer);
        process.exit(0);
    }, 30000);
}
init();
