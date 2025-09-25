"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeKafka = exports.getConsumer = exports.publishEvent = exports.initializeKafka = void 0;
const kafkajs_1 = require("kafkajs");
const logger_1 = __importDefault(require("../utils/logger"));
let kafka;
let producer;
let consumer;
const initializeKafka = async () => {
    try {
        kafka = new kafkajs_1.Kafka({
            clientId: 'user-service',
            brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        });
        producer = kafka.producer();
        consumer = kafka.consumer({ groupId: 'user-service-group' });
        await producer.connect();
        await consumer.connect();
        await consumer.subscribe({ topic: 'user-events' });
        logger_1.default.info('Kafka initialized successfully');
    }
    catch (error) {
        logger_1.default.error('Failed to initialize Kafka:', error);
        throw error;
    }
};
exports.initializeKafka = initializeKafka;
const publishEvent = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: message.id || Date.now().toString(),
                    value: JSON.stringify(message),
                    timestamp: Date.now().toString(),
                },
            ],
        });
        logger_1.default.info(`Event published to topic ${topic}:`, message);
    }
    catch (error) {
        logger_1.default.error(`Failed to publish event to topic ${topic}:`, error);
        throw error;
    }
};
exports.publishEvent = publishEvent;
const getConsumer = () => {
    if (!consumer) {
        throw new Error('Kafka consumer not initialized');
    }
    return consumer;
};
exports.getConsumer = getConsumer;
const closeKafka = async () => {
    try {
        if (producer)
            await producer.disconnect();
        if (consumer)
            await consumer.disconnect();
        logger_1.default.info('Kafka connections closed');
    }
    catch (error) {
        logger_1.default.error('Error closing Kafka connections:', error);
    }
};
exports.closeKafka = closeKafka;
//# sourceMappingURL=kafkaService.js.map