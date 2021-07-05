import type { Context } from 'koa';
import Koa from 'koa';
import KoaJson from 'koa-json';
import KoaLogger from 'koa-logger';
import KoaQs from 'koa-qs';
import KoaRoute from 'koa-route';

import { checkConnection } from './client';
import {
  getCount,
  getIndex,
  getPing,
  getSearch,
} from './request-handler';
import type { RequestHandler } from './types';
import RequestError from './util/errors/RequestError';
import logger from './util/logger';

const respond = (cb: RequestHandler) => async (ctx: Context) => {
  try {
    ctx.body = await cb(ctx);
  } catch (error) {
    if (error instanceof RequestError) {
      ctx.throw(error.toString(), error.statusCode);
    } else {
      ctx.throw(error.toString());
    }
  }
};

(async () => {
  try {
    await checkConnection();

    const app = new Koa();

    app.use(KoaLogger());
    app.use(KoaJson({ pretty: false, param: 'pretty' }));
    KoaQs(app, 'first');

    app.use(KoaRoute.get('/', respond(getIndex)));
    app.use(KoaRoute.get('/ping', respond(getPing)));
    app.use(KoaRoute.get('/count', respond(getCount)));
    app.use(KoaRoute.get('/search', respond(getSearch)));

    app.listen(3000);
  } catch (error) {
    logger.error(error);
    process.exit();
  }
})();
