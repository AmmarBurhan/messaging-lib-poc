import { ConfirmChannel, ConsumeMessage, Connection } from 'amqplib';
import { BaseMessage, IConsumeMessage } from './types';
export { ConsumeMessage };
export interface ConnectionConfiguration {
    heartbeat: number;
    hostname: string;
    port: number;
}
interface MessageBrokerSubscription {
    queueName: string;
    topics: Array<string>;
    handler(msg: IConsumeMessage<any>): void;
}
export declare class MessageBroker {
    connection: Connection | null;
    channel: ConfirmChannel | null;
    producerExchangeName: string;
    consumerQueues: Map<string, Array<MessageBrokerSubscription>>;
    urlIndex: number;
    waitingTime: number;
    config: ConnectionConfiguration;
    closedManually: boolean;
    messageCounter: number;
    consumerCode: string;
    isConnected: boolean;
    constructor(consumerCode: string, config: ConnectionConfiguration | null);
    private getConsumerCode;
    private resumeConsume;
    private _connect;
    init(): Promise<void>;
    broadcast<TMessage extends BaseMessage>(message: TMessage): Promise<boolean | undefined>;
    publishMessage<TMessage extends BaseMessage>(routingKey: string, message: TMessage): Promise<boolean | undefined>;
    createExchange(exchangeName: string): Promise<void>;
    trace<TMessage>(handler: (msg: IConsumeMessage<TMessage>) => void): Promise<void>;
    consume<TMessage>(exchangeName: string, topics: Array<string>, handler: (msg: IConsumeMessage<TMessage>) => void): Promise<void>;
    close(): Promise<void>;
}
export declare function getMessageBroker(consumerCode: string, config: ConnectionConfiguration | null): Promise<MessageBroker>;
export declare function getMessageTracer(config: ConnectionConfiguration): Promise<MessageBroker>;
