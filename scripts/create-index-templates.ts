import type { RequestBody } from '@elastic/elasticsearch/lib/Transport';

import { checkConnection, client, defaultIndex } from '../src/client';
import logger from '../src/util/logger';

const componentTemplate = {
  template: {
    settings: {
      analysis: {
        analyzer: {
          default: {
            char_filter: [
              'icu_normalizer',
            ],
            tokenizer: 'kuromoji_tokenizer',
            filter: [
              'kuromoji_baseform',
              'kuromoji_part_of_speech',
              'cjk_width',
              'ja_stop',
              'kuromoji_stemmer',
              'lowercase',
            ],
          },
        },
      },
    },
  },
};

const indexTemplate = {
  index_patterns: [defaultIndex],
  version: 1,
  composed_of: ['use_kuromoji_normalize_analyzer'],
  _meta: {
    description: `Template for index ${defaultIndex}`,
  },
};

const defineComponentTemplate = async (body: RequestBody) => {
  const name = 'use_kuromoji_normalize_analyzer';
  logger.info(`Defining component template: ${name}`);

  const response = await client.cluster.putComponentTemplate({ name, body });
  console.log(response.body);
};

const defineIndexTemplate = async (body: RequestBody) => {
  const name = 'template_1';
  logger.info(`Defining index template: ${name}`);

  const response = await client.indices.putIndexTemplate({ name, body });
  console.log(response.body);
};

(async () => {
  try {
    await checkConnection();
    await defineComponentTemplate(componentTemplate);
    await defineIndexTemplate(indexTemplate);
  } catch (error) {
    logger.error(error);
  }
})();
