import { MessageBroker, getMessageBroker, ConsumeMessage, ConnectionConfiguration } from './MessageBroker';
import { handler, exchange1, url } from './handlers';

function handler2 (msg: ConsumeMessage) {
    handler('handler 2', msg, interestingTopics);
}

const interestingTopics = ['wildbreeze.*.*.*']

async function init () {
    const conectionConfiguration: ConnectionConfiguration = {heartbeat: 5, hostname: url, port: 5674}
    const consumer2: MessageBroker = await getMessageBroker('abcd',conectionConfiguration);
    consumer2.consume(exchange1, interestingTopics, handler2);
}

init();
