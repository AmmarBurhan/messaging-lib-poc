import {MessageBroker, getMessageBroker, ConnectionConfiguration} from './MessageBroker';
import {exchange1, url} from './handlers';
import {BaseMessage} from './types';
import {getRandomRoute, getRandomMessage, routes1, messages} from './helper';

async function init () {
    let publishTimer: NodeJS.Timeout;
    let broadcastTimer: NodeJS.Timeout;
    const conectionConfiguration1: ConnectionConfiguration = {heartbeat: 5, hostname: url, port: 5672}

    const producer1: MessageBroker = await getMessageBroker('abcd', conectionConfiguration1);
    producer1.createExchange(exchange1);

    publishTimer = setInterval (async () => {
        if (producer1.isConnected) {
            const route: string = getRandomRoute(routes1);
            const message =  getRandomMessage(messages);
            const nodeRecieved: boolean | undefined = await producer1.publishMessage<BaseMessage>(route, message)
            if (nodeRecieved)
                console.log('sent\nmessage:', message, '\nwith topic of: ', route, '\n')
        }
        else
            console.log('not connected')
    }, 5000);

    broadcastTimer= setInterval (async() => {
        if (producer1.isConnected) {
            const message =  getRandomMessage(messages);
            const nodeRecieved: boolean | undefined = await producer1.broadcast<BaseMessage>(message);
            if (nodeRecieved)
                console.log('broadcast\nmessage:', message, '\n')
        }
        else
            console.log('not connected')
        
    }, 7000);

    setTimeout(()=>{
        clearInterval(broadcastTimer);
        clearInterval(publishTimer);
        process.exit(0);
    }, 30000)
}

init();
