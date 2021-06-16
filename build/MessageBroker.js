"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageTracer = exports.getMessageBroker = exports.MessageBroker = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const helper_1 = require("./helper");
const management_1 = require("./management");
const uuid_1 = require("uuid");
class MessageBroker {
    constructor(consumerCode, config) {
        this.connection = null;
        this.channel = null;
        this.producerExchangeName = '';
        this.consumerQueues = new Map();
        this.urlIndex = 0;
        this.waitingTime = 1000;
        this.config = config ? config : { heartbeat: 5, hostname: 'localhost', port: 0 };
        this.closedManually = false;
        this.messageCounter = 0;
        this.consumerCode = consumerCode;
        this.isConnected = false;
    }
    getConsumerCode() {
        return this.consumerCode.length <= 8 ? this.consumerCode : this.consumerCode.substring(0, 8);
    }
    resumeConsume() {
        this.consumerQueues.forEach((messageBrokerSubscriptions, exchangeName) => {
            messageBrokerSubscriptions.forEach(messageBrokerSubscription => {
                this.channel?.consume(messageBrokerSubscription.queueName, (msg) => {
                    if (msg) {
                        const messageContent = JSON.parse(msg.content.toString());
                        const message = {
                            fields: msg.fields,
                            properties: msg.properties,
                            content: messageContent,
                        };
                        try {
                            messageBrokerSubscription.handler(message);
                            this.channel?.ack(msg);
                        }
                        catch (err) {
                            console.error(err.message, err.stack);
                            this.channel?.nack(msg);
                        }
                    }
                });
            });
        });
    }
    async _connect(failed = false) {
        if (failed || this.config.port == 0) {
            console.log('connecting to least busy node...');
            if (failed) {
                management_1.connectionFailure(this.config.port);
                await helper_1.delay(1);
            }
            const runningNodes = await management_1.getConsumersPerRunningNode();
            this.config.port = management_1.nodesPorts[runningNodes[0].nodeName];
        }
        const options = { ...this.config };
        this.connection = await amqplib_1.default.connect(options);
        console.log(`connected to port: ${this.config.port}`);
        this.channel = await this.connection.createConfirmChannel();
        this.isConnected = true;
        if (failed)
            this.resumeConsume();
        this.connection.on('close', async () => {
            console.log('connection closed!');
            this.isConnected = false;
            if (!this.closedManually)
                process.nextTick(this._connect.bind(this), true);
        });
    }
    async init() {
        await this._connect();
    }
    async broadcast(message) {
        return await this.publishMessage('broadcast', message);
    }
    async publishMessage(routingKey, message) {
        message.messageCounter = ++this.messageCounter;
        return await this.channel?.publish(this.producerExchangeName, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
    }
    async createExchange(exchangeName) {
        this.producerExchangeName = exchangeName;
        await this.channel?.assertExchange(exchangeName, 'topic', {
            durable: true,
        });
    }
    async trace(handler) {
        const exchangeName = 'amq.rabbitmq.trace';
        const topics = ['deliver.*', 'publish.*'];
        const queue = await this.channel?.assertQueue('', {
            durable: true, arguments: { 'x-queue-type': 'quorum' }
        });
        if (queue) {
            topics.forEach(async (topic) => {
                await this.channel?.bindQueue(queue.queue, exchangeName, topic);
            });
            await this.channel?.consume(queue.queue, function (msg) {
                if (msg) {
                    const messageContent = JSON.parse(msg.content.toString());
                    const message = {
                        fields: msg.fields,
                        properties: msg.properties,
                        content: messageContent,
                    };
                    handler(message);
                }
            });
        }
    }
    async consume(exchangeName, topics, handler) {
        const _topics = new Set(topics);
        _topics.add('broadcast');
        let queueName;
        const allExchanges = await management_1.getExchanges();
        const consumerExchanges = allExchanges.filter(exchange => exchange.exchangeName === exchangeName && exchange.queues.some(queue => queue.queueName.includes(this.getConsumerCode())));
        if (consumerExchanges.length !== 0) {
            const index = consumerExchanges[0].queues.findIndex(queue => queue.bindings.length === _topics.size && queue.bindings.every(topic => _topics.has(topic)));
            if (index !== -1) {
                queueName = consumerExchanges[0].queues[index].queueName;
                console.log('connected to exisitng queue:', queueName);
            }
            else
                queueName = this.getConsumerCode() + uuid_1.v4().substring(9);
        }
        else
            queueName = this.getConsumerCode() + uuid_1.v4().substring(9);
        await this.channel?.assertExchange(exchangeName, 'topic', {
            durable: true,
        });
        const queue = await this.channel?.assertQueue(queueName, {
            durable: true,
            arguments: { 'x-queue-type': 'quorum' }
        });
        if (queue) {
            _topics.forEach(async (topic) => {
                await this.channel?.bindQueue(queue.queue, exchangeName, topic);
            });
            await this.channel?.consume(queueName, (msg) => {
                if (msg) {
                    const messageContent = JSON.parse(msg.content.toString());
                    const message = {
                        fields: msg.fields,
                        properties: msg.properties,
                        content: messageContent,
                    };
                    try {
                        handler(message);
                        this.channel?.ack(msg);
                    }
                    catch (err) {
                        console.error(err.message, err.stack);
                        this.channel?.nack(msg);
                    }
                }
            });
            const subscriptions = this.consumerQueues.has(exchangeName) ? this.consumerQueues.get(exchangeName) : [];
            if (subscriptions) {
                subscriptions.push({ queueName, topics, handler });
                this.consumerQueues.set(exchangeName, subscriptions);
            }
        }
    }
    async close() {
        this.closedManually = true;
        await this.channel?.close();
        await this.connection?.close();
        console.log('manually closed!');
    }
}
exports.MessageBroker = MessageBroker;
async function getMessageBroker(consumerCode, config) {
    if (consumerCode.length > 0) {
        const newMBroker = new MessageBroker(consumerCode, config);
        await newMBroker.init();
        return newMBroker;
    }
    console.error(`Consumer code should not be empty`);
    throw new Error('Consumer Code should not be empty');
}
exports.getMessageBroker = getMessageBroker;
async function getMessageTracer(config) {
    const newMBroker = new MessageBroker('tracer', config);
    await newMBroker.init();
    return newMBroker;
}
exports.getMessageTracer = getMessageTracer;
