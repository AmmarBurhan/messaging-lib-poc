"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionFailure = exports.nodesPorts = exports.getExchanges = exports.getConsumersPerRunningNode = exports.getNodes = void 0;
const handlers_1 = require("./handlers");
let port = 8081;
let client = require('http-rabbitmq-manager').client({
    host: handlers_1.url,
    port: port,
    timeout: 25000,
    user: 'guest',
    password: 'guest'
});
const portsMapping = {
    '5672': 8082,
    '5673': 8083,
    '5674': 8081,
};
const getNodes = async () => {
    const result = [];
    return new Promise((resolve, reject) => {
        client.listNodes((err, res) => {
            if (err)
                reject(err);
            else {
                res.forEach((node) => { result.push({ nodeName: node.name, running: node.running }); });
                resolve(result);
            }
        });
    });
};
exports.getNodes = getNodes;
const getConsumers = async () => {
    return new Promise((resolve, reject) => {
        client.listConsumers({ vhost: '/' }, (err, res) => {
            if (err)
                reject(err);
            else {
                resolve(res);
            }
        });
    });
};
const listExchangesAsync = async () => {
    return new Promise((resolve, reject) => {
        client.listExchanges({ vhost: '/' }, (err, res) => {
            if (err)
                reject(err);
            else {
                resolve(res);
            }
        });
    });
};
const listQueuesAsync = async () => {
    return new Promise((resolve, reject) => {
        client.listQueues({ vhost: '/' }, (err, res) => {
            if (err)
                reject(err);
            else {
                resolve(res);
            }
        });
    });
};
const listBindingsAsync = async () => {
    return new Promise((resolve, reject) => {
        client.listBindings({ vhost: '/' }, (err, res) => {
            if (err)
                reject(err);
            else {
                resolve(res);
            }
        });
    });
};
const getConsumersPerRunningNode = async () => {
    const nodes = await exports.getNodes();
    const runningNodes = nodes.filter(node => node.running === true);
    const consumers = await getConsumers();
    const result = [];
    runningNodes.forEach(runningNode => {
        const nodeConsumersCount = consumers.filter((consumer) => consumer.channel_details.node === runningNode.nodeName).length;
        result.push({ totalConsumers: nodeConsumersCount, nodeName: runningNode.nodeName });
    });
    result.sort((a, b) => a.totalConsumers - b.totalConsumers);
    return result;
};
exports.getConsumersPerRunningNode = getConsumersPerRunningNode;
const getExchanges = async () => {
    const result = [];
    const allExchanges = await listExchangesAsync();
    const clientsExchanges = allExchanges.filter((exchange) => exchange.name.length !== 0 && exchange.name.substring(0, 3) !== 'amq');
    const allQueues = await listQueuesAsync();
    const allBindings = await listBindingsAsync();
    clientsExchanges.forEach(clientExchange => {
        const managementQueues = [];
        allQueues.forEach((queue) => {
            const queueBindings = allBindings.filter((binding) => binding.destination_type === 'queue' && binding.destination === queue.name && binding.source === clientExchange.name);
            const managementQueue = { bindings: queueBindings.map((binding) => binding.routing_key), queueName: queue.name, leaderNode: queue.leader };
            managementQueues.push(managementQueue);
        });
        result.push({ exchangeName: clientExchange.name, queues: managementQueues });
    });
    return result;
};
exports.getExchanges = getExchanges;
exports.nodesPorts = { 'rabbit@rabbit-1': 5672, 'rabbit@rabbit-2': 5673, 'rabbit@rabbit-3': 5674 };
const init = async () => {
    // console.log(client)
    // client.getMessages({
    //     vhost : '/',
    //     queue : 'abcdb979-45a5-9e5e-368c100353cc',
    //     count : 5,
    //     requeue : true,
    //     encoding : "auto",
    //     truncate : 50000
    // }, function (err:Error, res:any) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(res);
    //     }
    // });
};
const connectionFailure = (port) => {
    port = portsMapping[port.toString()];
    client = require('http-rabbitmq-manager').client({
        host: 'localhost',
        port: port,
        timeout: 25000,
        user: 'guest',
        password: 'guest'
    });
};
exports.connectionFailure = connectionFailure;
init();
