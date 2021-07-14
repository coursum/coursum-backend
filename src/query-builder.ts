import type { ParsedUrlQueryInFirstMode } from './types';

interface addQueryOrFieldsOption <T extends {}>{
  query?: T;
  addToFields?: boolean;
}

const buildQuery = (params: ParsedUrlQueryInFirstMode) => {
  const fields = [
    'title*',
    'summary*',
  ];

  const filters: any[] = [];

  const addMultiMatchQueryOrFields = <T>(
    param: string,
    searchFields: string[],
    { query, addToFields = true }: addQueryOrFieldsOption<T> = {},
  ) => {
    if (param in params) {
      filters.push({
        multi_match: {
          query: query ?? params[param],
          fields: searchFields,
        },
      });
    } else if (addToFields) {
      fields.push(...searchFields);
    }
  };

  const addTermQueryOrField = <T>(
    param: string,
    searchField: string,
    { query, addToFields = true }: addQueryOrFieldsOption<T> = {},
  ) => {
    if (param in params) {
      filters.push({
        term: {
          [searchField]: query ?? params[param],
        },
      });
    } else if (addToFields) {
      fields.push(searchField);
    }
  };

  addMultiMatchQueryOrFields('teacher', ['lecturers.name*']);
  addMultiMatchQueryOrFields('semester', ['schedule.semester*']);
  if ('times' in params) {
    filters.push({
      multi_match: {
        query: params.times,
        type: 'phrase_prefix',
        fields: ['schedule.times.ja', 'schedule.times.en'],
      },
    });
  } else {
    fields.push(...['schedule.times.ja', 'schedule.times.en']);
  }
  addTermQueryOrField('classroom', 'classroom.keyword');
  addTermQueryOrField('credit', 'credit', { addToFields: false });
  addMultiMatchQueryOrFields('language', ['language.ja.keyword', 'language.en.keyword']);
  addTermQueryOrField('id', 'yearClassId.keyword');
  // TODO: handle query contains giga & remove { addToFields: false }
  addTermQueryOrField('code', 'tag.curriculumCode.keyword');
  addMultiMatchQueryOrFields('category', ['tag.category*']);
  addTermQueryOrField('giga', 'tag.giga', { query: true, addToFields: false });

  let mustQuery = {};

  if (params.query) {
    mustQuery = {
      must: {
        multi_match: {
          query: params.query,
          type: 'cross_fields',
          fields,
          operator: 'and',
        },
      },
    };
  }

  let filterQuery = {};
  if (filters.length === 1) {
    filterQuery = { filter: filters[0] };
  } else if (filters.length > 1) {
    filterQuery = { filter: filters };
  }

  const boolQuery = { ...mustQuery, ...filterQuery };

  // TODO: find a better type for query
  let query: {} = { match_none: {} };

  if (Object.keys(boolQuery).length > 0) {
    query = { bool: boolQuery };
  }

  return query;
};

export default buildQuery;
