import { Queue, Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  attachment?: { filename: string; content: string };
}

export interface WhatsappJobData {
  to: string;
  message: string;
}

export interface ReminderJobData {
  customerId: string;
  type: string;
  dueAt: string;
}

export interface AlertJobData {
  type: 'low_stock';
  productName: string;
  currentStock: number;
  threshold: number;
}

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: { count: 100 },
};

type QueueLike<T> = { add: (name: string, data: T) => Promise<unknown> };

function createNoopQueue<T>(): QueueLike<T> {
  return {
    add: async () => {},
  };
}

function createQueues() {
  if (!config.redis.enabled) {
    return {
      emailQueue: createNoopQueue<EmailJobData>(),
      whatsappQueue: createNoopQueue<WhatsappJobData>(),
      reminderQueue: createNoopQueue<ReminderJobData>(),
      alertQueue: createNoopQueue<AlertJobData>(),
      connection: null,
    };
  }

  const RedisClient = Redis as unknown as new (opts: object) => object;
  const connection = new RedisClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  const emailQueue = new Queue<EmailJobData>('email', {
    connection,
    defaultJobOptions: defaultJobOptions,
  });
  const whatsappQueue = new Queue<WhatsappJobData>('whatsapp', {
    connection,
    defaultJobOptions: defaultJobOptions,
  });
  const reminderQueue = new Queue<ReminderJobData>('reminder', {
    connection,
    defaultJobOptions: { ...defaultJobOptions, attempts: 2, backoff: { type: 'exponential' as const, delay: 2000 } },
  });
  const alertQueue = new Queue<AlertJobData>('alert', {
    connection,
    defaultJobOptions: { ...defaultJobOptions, attempts: 2, backoff: { type: 'exponential' as const, delay: 2000 } },
  });

  return {
    emailQueue,
    whatsappQueue,
    reminderQueue,
    alertQueue,
    connection,
  };
}

const { emailQueue, whatsappQueue, reminderQueue, alertQueue, connection } = createQueues();

export { emailQueue, whatsappQueue, reminderQueue, alertQueue };

async function processEmail(job: Job<EmailJobData>) {
  logger.info('Processing email job', { jobId: job.id, to: job.data.to });
  return { sent: true };
}

async function processWhatsapp(job: Job<WhatsappJobData>) {
  logger.info('Processing WhatsApp job', { jobId: job.id, to: job.data.to });
  return { sent: true };
}

async function processReminder(job: Job<ReminderJobData>) {
  logger.info('Processing reminder job', { jobId: job.id, customerId: job.data.customerId });
  return { processed: true };
}

async function processAlert(job: Job<AlertJobData>) {
  logger.info('Processing alert job', { jobId: job.id, type: job.data.type });
  return { processed: true };
}

export function startQueueWorkers() {
  if (!config.redis.enabled || !connection) {
    logger.info('BullMQ workers skipped (Redis disabled)');
    return;
  }
  new Worker('email', processEmail, { connection });
  new Worker('whatsapp', processWhatsapp, { connection });
  new Worker('reminder', processReminder, { connection });
  new Worker('alert', processAlert, { connection });
  logger.info('BullMQ workers started');
}
