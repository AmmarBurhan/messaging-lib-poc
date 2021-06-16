import amqplib, { ConfirmChannel, ConsumeMessage, Replies, Options , Connection} from 'amqplib';
import { BaseMessage, IConsumeMessage } from './types';
import { delay } from './helper';
import {connectionFailure, nodesPorts, getExchanges, getConsumersPerRunningNode,  ManagementConsumers, ManagementExchanges} from './management'
import { v4 } from 'uuid';

export { ConsumeMessage };

export interface ConnectionConfiguration {
  heartbeat: number; hostname:string; port:number; 
}

interface MessageBrokerSubscription {
  queueName: string;
  topics: Array<string>;
  handler(msg: IConsumeMessage<any>): void;
}

export class MessageBroker {
  connection: Connection | null;
  channel: ConfirmChannel | null;
  producerExchangeName: string;
  consumerQueues: Map<string, Array<MessageBrokerSubscription>>;
  urlIndex: number;
  waitingTime: number;
  config: ConnectionConfiguration;
  closedManually: boolean;
  messageCounter: number;
  consumerCode: string
  isConnected: boolean

  constructor(consumerCode: string, config: ConnectionConfiguration | null) {
    this.connection = null;
    this.channel = null;
    this.producerExchangeName = '';
    this.consumerQueues = new Map<string, Array<MessageBrokerSubscription>>();
    this.urlIndex = 0;
    this.waitingTime = 1000;
    this.config = config? config : {heartbeat: 5, hostname:'localhost', port: 0};
    this.closedManually=false;
    this.messageCounter = 0;
    this.consumerCode = consumerCode;
    this.isConnected = false;
  }

  private getConsumerCode (): string {
    return this.consumerCode.length <= 8? this.consumerCode : this.consumerCode.substring(0,8); 
  }
  

  private resumeConsume <TMessage>() {
    this.consumerQueues.forEach((messageBrokerSubscriptions, exchangeName) => {
      messageBrokerSubscriptions.forEach(messageBrokerSubscription => {
        this.channel?.consume(messageBrokerSubscription.queueName, (msg: ConsumeMessage | null) => {
          if (msg) {
            const messageContent: TMessage = JSON.parse(msg.content.toString());
            const message: IConsumeMessage<TMessage> = {
              fields: msg.fields,
              properties: msg.properties,
              content: messageContent,
            };
            try {
              messageBrokerSubscription.handler(message);
              this.channel?.ack(msg);
            }
            catch (err) {
              console.error(err.message, err.stack)
              this.channel?.nack(msg);
            }
            
          }
        })
      })
    })
  }

  private async _connect (failed :boolean = false) {
    if (failed || this.config.port == 0) {
      console.log('connecting to least busy node...');
      if (failed) {
        connectionFailure(this.config.port)
        await delay (1)
      }
      const runningNodes: Array<ManagementConsumers> = await getConsumersPerRunningNode();
      this.config.port=nodesPorts[runningNodes[0].nodeName] 
    }
    
    const options: Options.Connect = {...this.config }
    this.connection=await amqplib.connect(options);
    console.log(`connected to port: ${this.config.port}`);
    this.channel = await this.connection.createConfirmChannel();
    this.isConnected = true;
    if (failed)
      this.resumeConsume<BaseMessage>()
    this.connection.on('close', async() => {
      console.log('connection closed!');
      this.isConnected = false
      if(!this.closedManually)
        process.nextTick(this._connect.bind(this), true);
    })

  }
  async init() {
    
      await this._connect();
  }

  async broadcast<TMessage extends BaseMessage>(message: TMessage): Promise<boolean | undefined> {
    return await this.publishMessage<TMessage>('broadcast', message);
  }

  async publishMessage<TMessage extends BaseMessage>(
    routingKey: string,
    message: TMessage
  ): Promise<boolean | undefined> {
    message.messageCounter = ++this.messageCounter;
    
    return await this.channel?.publish(
      this.producerExchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),{persistent: true}
    );
  }

  async createExchange(exchangeName: string): Promise<void> {
    this.producerExchangeName = exchangeName;
    await this.channel?.assertExchange(exchangeName, 'topic', {
      durable: true,
    });
  }
  async trace<TMessage>(handler: (msg: IConsumeMessage<TMessage>) => void): Promise<void> {
    const exchangeName = 'amq.rabbitmq.trace';
    const topics = ['deliver.*', 'publish.*'];
    const queue:
    | Replies.AssertQueue
    | undefined = await this.channel?.assertQueue('', {
    durable: true,arguments:{'x-queue-type':'quorum'}
    });
    if (queue) {
      topics.forEach(
        async (topic: string): Promise<void> => {
          await this.channel?.bindQueue(queue.queue, exchangeName, topic);
        }
      );

      await this.channel?.consume(
        queue.queue,
        function (msg: ConsumeMessage | null) {
          if (msg) {
            const messageContent: TMessage = JSON.parse(msg.content.toString());
            const message: IConsumeMessage<TMessage> = {
              fields: msg.fields,
              properties: msg.properties,
              content: messageContent,
            };
            handler(message);
          }
        }
      )
    }
  }

  async consume<TMessage>(
    exchangeName: string,
    topics: Array<string>,
    handler: (msg: IConsumeMessage<TMessage>) => void
  ): Promise<void> {
    const _topics: Set<string> = new Set(topics);
    _topics.add ('broadcast');

    let queueName: string
    const allExchanges: Array<ManagementExchanges> = await getExchanges()
    const consumerExchanges: Array<ManagementExchanges> = allExchanges.filter(exchange => exchange.exchangeName === exchangeName && exchange.queues.some(queue => queue.queueName.includes(this.getConsumerCode())));
    if (consumerExchanges.length !== 0) {
      const index: number = consumerExchanges[0].queues.findIndex(queue => queue.bindings.length === _topics.size && queue.bindings.every(topic => _topics.has(topic)))
      if (index !== -1) {
        queueName=consumerExchanges[0].queues[index].queueName
        console.log('connected to exisitng queue:', queueName)
      }
      else
        queueName = this.getConsumerCode() + v4().substring(9);
    }
    else
      queueName = this.getConsumerCode() + v4().substring(9);
    
    await this.channel?.assertExchange(exchangeName, 'topic', {
      durable: true,
    });

    const queue:
    | Replies.AssertQueue
    | undefined = await this.channel?.assertQueue(queueName, {
    durable: true,
    arguments:{'x-queue-type':'quorum'}
  });
  if (queue) {
    _topics.forEach(
      async (topic: string): Promise<void> => {
        await this.channel?.bindQueue(queue.queue, exchangeName, topic);
      }
    );
    await this.channel?.consume(
      queueName,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const messageContent: TMessage = JSON.parse(msg.content.toString());
          const message: IConsumeMessage<TMessage> = {
            fields: msg.fields,
            properties: msg.properties,
            content: messageContent,
          };
            try {
              handler(message);
              this.channel?.ack(msg);
            }
            catch (err) {
              console.error(err.message, err.stack)
              this.channel?.nack(msg);
            }
        }
      }
    );
    const subscriptions: Array<MessageBrokerSubscription> | undefined = this.consumerQueues.has(exchangeName)? this.consumerQueues.get(exchangeName) : []
      if (subscriptions) {
        subscriptions.push({queueName, topics, handler})
        this.consumerQueues.set(exchangeName, subscriptions)
      }
    }
  }

  async close() {
    this.closedManually = true;
    await this.channel?.close();
    await this.connection?.close();
    console.log('manually closed!')
    
  }
}

export async function getMessageBroker(consumerCode: string, config: ConnectionConfiguration | null): Promise<MessageBroker> {
  if(consumerCode.length > 0) {
    const newMBroker = new MessageBroker(consumerCode, config);
    await newMBroker.init();
    return newMBroker;
  }
  console.error(`Consumer code should not be empty`)
  throw new Error('Consumer Code should not be empty');
}

export async function getMessageTracer(config: ConnectionConfiguration): Promise<MessageBroker> {
  const newMBroker = new MessageBroker('tracer', config);
  await newMBroker.init();
  return newMBroker;
}