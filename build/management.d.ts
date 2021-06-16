export declare const getNodes: () => Promise<Array<ManagementNode>>;
export declare const getConsumersPerRunningNode: () => Promise<Array<ManagementConsumers>>;
export declare const getExchanges: () => Promise<Array<ManagementExchanges>>;
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
    queues: Array<ManagementQueue>;
}
export interface ManagementNodesPorts {
    [key: string]: number;
    'rabbit@rabbit-1': number;
    'rabbit@rabbit-2': number;
    'rabbit@rabbit-3': number;
}
export declare const nodesPorts: ManagementNodesPorts;
export declare const connectionFailure: (port: number) => void;
