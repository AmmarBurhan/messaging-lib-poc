import {MessageBroker, getMessageBroker, ConsumeMessage, ConnectionConfiguration} from './MessageBroker';
import {handler, exchange1, url} from './handlers';

const interestingTopics = ['wildbreeze.*.*.*']

function handler1 (msg: ConsumeMessage) {
    handler('handler 1', msg, interestingTopics);
}

async function init () {
    const conectionConfiguration: ConnectionConfiguration = {heartbeat: 5, hostname: url, port: 5673}
    const consumer1: MessageBroker = await getMessageBroker('abcd', conectionConfiguration);
    consumer1.consume(exchange1, interestingTopics, handler1);
}

init();
