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
    param: string | undefined,
    searchFields: string[],
    { query, addToFields = true }: addQueryOrFieldsOption<T> = {},
  ) => {
    if (param) {
      filters.push({
        multi_match: {
          query: query ?? param,
          fields: searchFields,
        },
      });
    } else if (addToFields) {
      fields.push(...searchFields);
    }
  };

  const addTermQueryOrField = <T>(
    param: string | undefined,
    searchField: string,
    { query, addToFields = true }: addQueryOrFieldsOption<T> = {},
  ) => {
    if (param) {
      filters.push({
        term: {
          [searchField]: query ?? param,
        },
      });
    } else if (addToFields) {
      fields.push(searchField);
    }
  };

  addMultiMatchQueryOrFields(params.teacher, ['lecturers.name*']);
  addMultiMatchQueryOrFields(params.semester, ['schedule.semester*']);

  if (params.times) {
    filters.push({
      bool: {
        should: [
          { term: { 'schedule.times.ja.keyword': params.times } },
          { term: { 'schedule.times.en.keyword': params.times } },
        ],
      },
    });
  } else {
    fields.push('schedule.times*');
  }

  addTermQueryOrField(params.classroom, 'classroom.keyword');
  addTermQueryOrField(params.credit, 'credit', { addToFields: false });
  addMultiMatchQueryOrFields(params.language, ['language.ja.keyword', 'language.en.keyword']);
  addTermQueryOrField(params.id, 'yearClassId.keyword');
  // TODO: handle query contains giga & remove { addToFields: false }
  addTermQueryOrField(params.code, 'tag.curriculumCode.keyword');
  addMultiMatchQueryOrFields(params.category, ['tag.category*']);
  addTermQueryOrField(params.giga, 'tag.giga', { query: true, addToFields: false });

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
