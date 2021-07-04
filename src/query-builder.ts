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

  const filter: any[] = [];

  const addMultiMatchQueryOrFields = <T>(
    param: string | undefined,
    searchFields: string[],
    { query, addToFields = true }: addQueryOrFieldsOption<T> = {},
  ) => {
    if (param) {
      filter.push({
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
      filter.push({
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
  addMultiMatchQueryOrFields(params.times, ['schedule.times*']);
  addTermQueryOrField(params.classroom, 'classroom.keyword');
  addTermQueryOrField(params.credit, 'credit', { addToFields: false });
  addMultiMatchQueryOrFields(params.language, ['language.ja.keyword', 'language.en.keyword']);
  addTermQueryOrField(params.id, 'yearClassId.keyword');
  // TODO: handle query contains giga & remove { addToFields: false }
  addTermQueryOrField(params.code, 'tag.curriculumCode.keyword');
  addMultiMatchQueryOrFields(params.category, ['tag.category*']);
  addTermQueryOrField(params.giga, 'tag.giga', { query: true, addToFields: false });

  const mustQuery = params.query ? {
    must: {
      multi_match: {
        query: params.query,
        type: 'cross_fields',
        fields,
        operator: 'and',
      },
    },
  } : {};

  const query = {
    bool: {
      ...mustQuery,
      filter,
    },
  };

  return query;
};

export default buildQuery;
