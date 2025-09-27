import { Kafka, Producer, Consumer } from 'kafkajs';
import logger from '../utils/logger';

let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;

export const initializeKafka = async (): Promise<void> => {
  try {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    logger.info('Initializing Kafka with brokers:', brokers);
    
    kafka = new Kafka({
      clientId: 'user-service',
      brokers: brokers,
      connectionTimeout: 10000,
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    producer = kafka.producer({
      retry: {
        initialRetryTime: 100,
        retries: 3
      }
    });
    consumer = kafka.consumer({ 
      groupId: 'user-service-group',
      retry: {
        initialRetryTime: 100,
        retries: 3
      }
    });

    // Enhanced connection with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await producer.connect();
        await consumer.connect();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        logger.info(`Kafka connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

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