import type { Context } from 'koa';
import Koa from 'koa';
import KoaJson from 'koa-json';
import KoaQs from 'koa-qs';
import _ from 'koa-route';

import { checkConnection } from './client';
import {
  getCount,
  getIndex,
  getPing,
  getSearch,
} from './request-handler';
import type { RequestHandler } from './types';
import logger from './util/logger';

const respond = (cb: RequestHandler) => async (ctx: Context) => {
  ctx.body = await cb(ctx);
};

(async () => {
  try {
    await checkConnection();

    const app = new Koa();

    // TODO: fix the problem that `?pretty=false` will still respond with a prettified result
    app.use(KoaJson({ pretty: false, param: 'pretty' }));
    KoaQs(app, 'first');

    app.use(_.get('/', respond(getIndex)));
    app.use(_.get('/ping', respond(getPing)));
    app.use(_.get('/count', respond(getCount)));
    app.use(_.get('/search', respond(getSearch)));

    app.listen(3000);
  } catch (error) {
    logger.error(error);
    process.exit();
  }
})();
