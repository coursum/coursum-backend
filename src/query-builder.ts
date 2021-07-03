import type { ParsedUrlQueryInFirstMode } from './types';

const buildQuery = (params: ParsedUrlQueryInFirstMode) => {
  const fields = [
    'title*',
    'summary*',
    'curriculumCode',
  ];

  const conditions = [];

  if (params.giga) {
    conditions.push({
      term: {
        'tag.giga': true,
      },
    });
  }

  if (params.language) {
    conditions.push({
      term: {
        'language.en.keyword': params.language,
      },
    });
  } else {
    fields.push('language*');
  }

  if (params.classroom) {
    conditions.push({
      term: {
        'classroom.keyword': params.classroom,
      },
    });
  }

  if (params.category) {
    conditions.push({
      multi_match: {
        query: params.category,
        fields: ['category*'],
      },
    });
  } else {
    fields.push('category*');
  }

  if (params.semester) {
    conditions.push({
      multi_match: {
        query: params.semester,
        fields: ['schedule.semester*'],
      },
    });
  } else {
    fields.push('schedule.semester*');
  }

  if (params.teacher) {
    conditions.push({
      multi_match: {
        query: params.teacher,
        fields: ['lecturers.name*'],
      },
    });
  } else {
    fields.push('lecturers.name*');
  }

  if (params.times) {
    conditions.push({
      multi_match: {
        query: params.times,
        fields: ['schedule.times*'],
      },
    });
  } else {
    fields.push('schedule.times*');
  }

  if (params.query) {
    conditions.push({
      multi_match: {
        query: params.query,
        type: 'cross_fields',
        fields,
        operator: 'and',
      },
    });
  }

  const query = {
    bool: {
      must: conditions,
    },
  };

  return query;
};

export default buildQuery;
