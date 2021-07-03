import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

import logger from './util/logger';

dotenv.config();

const username = 'elastic';
const password = process.env.ELASTIC_PASSWORD;

if (!password) {
  logger.error('No passoword is provided in .env');
  process.exit();
}

const getDefaultIndex = () => {
  const defaultIndex = process.env.ELASTICSEARCH_DEFAULT_INDEX;

  if (!defaultIndex) {
    logger.error('No default index is provided in .env');
    process.exit();
  }

  return defaultIndex;
};

const defaultIndex = getDefaultIndex();

const client = new Client({
  node: process.env.NODE_ENV === 'production' ? 'http://elasticsearch:9200' : 'http://localhost:9200',
  auth: { username, password },
});

const checkConnection = async () => {
  try {
    await client.ping();
    logger.info('Connected to the elasticsearch instance');
  } catch (error) {
    logger.error('Fail to connect to the elasticsearch instance');
    console.error(error);
    process.exit();
  }
};

export {
  client,
  checkConnection,
  defaultIndex,
};
