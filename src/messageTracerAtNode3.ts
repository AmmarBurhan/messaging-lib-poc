import { MessageBroker, ConsumeMessage, ConnectionConfiguration, getMessageTracer } from './MessageBroker';
import { url, traceHandler } from './handlers';

function handler2 (msg: ConsumeMessage) {
    traceHandler('Tracing Handler', msg, interestingTopics);
}

const interestingTopics = ['wildbreeze.*.*.*'];

async function init () {
    const conectionConfiguration1: ConnectionConfiguration = {heartbeat: 5, hostname: url, port: 5674}
    const messageTracer1: MessageBroker = await getMessageTracer(conectionConfiguration1);
    messageTracer1.trace(handler2);
}

init();
