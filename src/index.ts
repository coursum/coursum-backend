import Koa from 'koa';
import json from 'koa-json';
import _ from 'koa-route';

import { checkConnection, client } from './client';
import logger from './util/logger';

const respond = (body: unknown) => async (ctx: Koa.Context) => {
  ctx.body = await body;
};

const getAggregateCount = async () => {
  const { body: indicesInformation } = await client.cat.indices<Record<string, string>[]>({ format: 'json' });
  const nonSystemIndices = indicesInformation.filter(({ index }) => !index.startsWith('.'));
  const aggregateCount = nonSystemIndices.reduce(
    (acc, { index, 'docs.count': count }) => {
      acc[index] = parseInt(count, 10);
      return acc;
    },
    {} as Record<string, number>,
  );

  return aggregateCount;
};

(async () => {
  try {
    await checkConnection();

    const app = new Koa();

    app.use(json({ pretty: false, param: 'pretty' }));

    app.use(_.get('/', respond('Hello, Coursum Server!')));
    app.use(_.get('/ping', respond({ message: 'pong' })));
    app.use(_.get('/count', respond(getAggregateCount())));
    app.use(_.get('/search', respond('Under implementation')));

    app.listen(3000);
  } catch (error) {
    logger.error(error);
    process.exit();
  }
})();
