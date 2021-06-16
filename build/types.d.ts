import { ConsumeMessageFields, MessageProperties } from 'amqplib';
export interface BaseMessage {
    sourceServiceName: string;
    timestamp: string;
    requestId: string;
    correlationId: string;
    messageCounter: number;
}
export interface IConsumeMessage<TMessage> {
    fields: ConsumeMessageFields;
    properties: MessageProperties;
    content: TMessage;
}
