import { Kafka, Producer, Consumer } from 'kafkajs';
import logger from '../utils/logger';

let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;

export const initializeKafka = async (): Promise<void> => {
  try {
    kafka = new Kafka({
      clientId: 'user-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    });

    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: 'user-service-group' });

    await producer.connect();
    await consumer.connect();

    // Subscribe to topics
    await consumer.subscribe({ topic: 'user-events' });

    logger.info('Kafka initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Kafka:', error);
    throw error;
  }
};

export const publishEvent = async (topic: string, message: any): Promise<void> => {
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
    
    logger.info(`Event published to topic ${topic}:`, message);
  } catch (error) {
    logger.error(`Failed to publish event to topic ${topic}:`, error);
    throw error;
  }
};

export const getConsumer = (): Consumer => {
  if (!consumer) {
    throw new Error('Kafka consumer not initialized');
  }
  return consumer;
};

export const closeKafka = async (): Promise<void> => {
  try {
    if (producer) await producer.disconnect();
    if (consumer) await consumer.disconnect();
    logger.info('Kafka connections closed');
  } catch (error) {
    logger.error('Error closing Kafka connections:', error);
  }
};