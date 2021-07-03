import type { Context } from 'koa';

export type JSONResponse = Record<string, string>

export interface SearchResponse<T> {
  stat: {
    total: number;
    latency: number; // Unit: milliseconds
  };
  hits: T[]; // | null;
}

export type ParsedUrlQueryInFirstMode = Record<string, string | undefined>

export type RequestHandler = (ctx: Context) => any | Promise<any>
