import { ResponseError } from '@elastic/elasticsearch/lib/errors';

import { checkConnection, client, defaultIndex } from '../src/client';
import logger from '../src/util/logger';

const deleteDefaultIndex = async () => {
  const index = defaultIndex;
  logger.info(`Deleting course index: ${index}`);

  const response = await client.indices.delete({ index });
  console.log(response.body);
};

(async () => {
  try {
    await checkConnection();
    await deleteDefaultIndex();
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(error.message);
    }
  }
})();
