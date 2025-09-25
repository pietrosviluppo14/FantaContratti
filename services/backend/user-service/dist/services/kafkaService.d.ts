import { Consumer } from 'kafkajs';
export declare const initializeKafka: () => Promise<void>;
export declare const publishEvent: (topic: string, message: any) => Promise<void>;
export declare const getConsumer: () => Consumer;
export declare const closeKafka: () => Promise<void>;
//# sourceMappingURL=kafkaService.d.ts.map