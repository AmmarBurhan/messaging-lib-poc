import {url} from './handlers';
let port: number = 8081;

let client = require('http-rabbitmq-manager').client({
    host : url,
    port : port,
    timeout : 25000,
    user : 'guest',
    password : 'guest'
});
interface PortsMapping {
    [index: string]: number
}
const portsMapping: PortsMapping = {
    '5672': 8082,
    '5673': 8083,
    '5674': 8081,
}
const getNodes = async (): Promise<Array<ManagementNode>> => {
    const result: Array<ManagementNode> =[];
    return new Promise((resolve, reject) => {
        client.listNodes((err:Error, res: any) => {
            if (err)
                reject(err)
            else {
                res.forEach((node:any) => {result.push({nodeName: node.name, running:node.running})})
                resolve(result);
            }
            
        })

    })
} 

const getConsumers = async (): Promise<Array<ManagementNode>> => {
    return new Promise((resolve, reject) => {
        client.listConsumers({vhost:'/'},(err:Error, res: any) => {
            if (err)
                reject(err)
            else {
                resolve(res);
            }
        })
    })
}

const listExchangesAsync = async (): Promise<Array<ManagementNode>> => {
    return new Promise((resolve, reject) => {
        client.listExchanges({vhost:'/'},(err:Error, res: any) => {
            if (err)
                reject(err)
            else {
                resolve(res);
            }
        })
    })
}

const listQueuesAsync = async (): Promise<Array<ManagementNode>> => {
    return new Promise((resolve, reject) => {
        client.listQueues({vhost:'/'},(err:Error, res: any) => {
            if (err)
                reject(err)
            else {
                resolve(res);
            }
        })
    })
}

const listBindingsAsync = async (): Promise<Array<ManagementNode>> => {
    return new Promise((resolve, reject) => {
        client.listBindings({vhost:'/'},(err:Error, res: any) => {
            if (err)
                reject(err)
            else {
                resolve(res);
            }
        })
    })
}

export const getConsumersPerRunningNode = async (): Promise<Array<ManagementConsumers>> => {
    const nodes: Array<ManagementNode> = await getNodes();
    const runningNodes: Array<ManagementNode> = nodes.filter(node => node.running === true)
    const consumers = await getConsumers();
    const result: Array<ManagementConsumers> =[];
    runningNodes.forEach(runningNode => {
        const nodeConsumersCount = consumers.filter((consumer:any) => consumer.channel_details.node === runningNode.nodeName).length;
        result.push({totalConsumers:nodeConsumersCount, nodeName: runningNode.nodeName })
    })
    result.sort((a,b) => a.totalConsumers-b.totalConsumers)
    return result
}

export const getExchanges = async (): Promise<Array<ManagementExchanges>> => {
    const result: Array<ManagementExchanges> = [];
    const allExchanges: Array<any> = await listExchangesAsync();
    const clientsExchanges: Array<any> = allExchanges.filter((exchange: any) => exchange.name.length !== 0 && exchange.name.substring(0,3) !== 'amq');
    const allQueues = await listQueuesAsync();
    const allBindings = await listBindingsAsync();
    clientsExchanges.forEach(clientExchange => {
        const managementQueues: Array<ManagementQueue> = []
        allQueues.forEach((queue:any) => {
            const queueBindings = allBindings.filter((binding:any) =>
                binding.destination_type === 'queue' && binding.destination === queue.name && binding.source === clientExchange.name
            )
            const managementQueue: ManagementQueue = {bindings:queueBindings.map((binding:any) => binding.routing_key), queueName:queue.name, leaderNode: queue.leader}
            managementQueues.push(managementQueue);
        })
        result.push({exchangeName: clientExchange.name, queues: managementQueues});
    })
    return result
}

export interface ManagementNode {
    nodeName: string;
    running: boolean;
    
}

export interface ManagementQueue {
    queueName: string;
    bindings: Array<string>;
    leaderNode: string;
}

export interface ManagementConsumers {
    nodeName: string;
    totalConsumers: number;
}

export interface ManagementExchanges {
    exchangeName: string;
    queues: Array<ManagementQueue>
}

export interface ManagementNodesPorts {
    [key:string]: number;
    'rabbit@rabbit-1': number;
    'rabbit@rabbit-2': number;
    'rabbit@rabbit-3': number;
}

export const nodesPorts: ManagementNodesPorts = {'rabbit@rabbit-1': 5672,'rabbit@rabbit-2': 5673,'rabbit@rabbit-3': 5674} 

const init = async (): Promise<void> => {
    
}

export const connectionFailure = (port: number) => {
    port = portsMapping[port.toString()];
    client = require('http-rabbitmq-manager').client({
        host : 'localhost',
        port : port,
        timeout : 25000,
        user : 'guest',
        password : 'guest'
    });
}

init();
