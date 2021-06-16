import {ConsumeMessage} from './MessageBroker';

function handler (handlerName: string, msg: ConsumeMessage, topics: Array<string>) {
    const message: object = msg.content;
    const topic: string = msg.fields.routingKey;
    console.log(`${msg.fields.exchange}: ${topics}`);
    console.log(`${handlerName}:\ntopic: ${topic}`)
    console.log('content:', message);
    console.log();
}

function traceHandler (handlerName: string, msg: ConsumeMessage, topics: Array<string>) {
    const message: object = msg.content;
    const topic: string = msg.fields.routingKey;
    console.log('****** TRACING START ******')
    console.log(`${handlerName}:\ntopic: ${topic}`);
    console.log('Node:', msg.properties.headers.node)
    console.log('content:', message);
    console.log('****** TRACING END******\n');
}

const exchange1 = 'highFive_exchange'
// const exchange2 = 'users_exchange';
const url = 'localhost';

export {exchange1, handler, url, traceHandler}