import type { Course } from 'coursum-types';
import type { Context } from 'koa';
import _ from 'koa-route';

import { client, defaultIndex } from './client';
import buildQuery from './query-builder';
import type { JSONResponse, ParsedUrlQueryInFirstMode, SearchResponse } from './types';
import RequestError from './util/errors/RequestError';
import logger from './util/logger';

const getAggregateCount = async () => {
  const { body: indicesInformation } = await client.cat.indices<JSONResponse[]>({ format: 'json' });
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

const countDocument = async (index: string) => {
  const { body: [{ count: indexCount }] } = await client.cat.count<JSONResponse[]>({ index, format: 'json' });

  const parsedCount = parseInt(indexCount, 10);

  if (Number.isNaN(parsedCount)) {
    const error = Error('Failed to parse index count');
    logger.error(error.message);

    throw error;
  }

  return parsedCount;
};

const buildSearchResponse = <T>(body: Record<string, any>) => {
  const response: SearchResponse<T> = {
    stat: {
      total: body.hits.hits.length,
      latency: body.took,
    },
    // Hide response detail
    hits: body.hits.hits.map(({ _source }: { _source: T }) => _source),
  };

  return response;
};

const searchCourse = async (query: any) => {
  const index = defaultIndex;
  const body = query;
  const count = await countDocument(defaultIndex);
  const defaultSizeLimit = 1000;
  const size = Math.min(count, defaultSizeLimit);

  const { body: validation } = await client.indices.validateQuery({ index, body, explain: true });

  if (!validation.valid) {
    logger.debug(validation);

    throw new RequestError('Query Validation Error', JSON.stringify(validation, null, 2), 400);
  }

  const { body: searchResult } = await client.search({ index, body, size });
  const response = buildSearchResponse<Course>(searchResult);

  return response;
};

const getIndex = () => 'Hello, Coursum Server!';
const getPing = () => ({ message: 'ping' });
const getCount = getAggregateCount;
const getSearch = async (ctx: Context) => {
  const query = (
    ('all' in ctx.query)
      ? { match_all: {} }
      : buildQuery(ctx.query as ParsedUrlQueryInFirstMode)
  );

  logger.debug(JSON.stringify(query, null, 2));

  return searchCourse({ query });
};

export {
  getIndex,
  getPing,
  getCount,
  getSearch,
};
