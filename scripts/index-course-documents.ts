import { readFile, readdir } from 'fs/promises';
import path from 'path';

import type { Course } from 'coursum-types';

import { checkConnection, client, defaultIndex } from '../src/client';
import logger from '../src/util/logger';

const filepath = 'database/syllabus-json-files';

async function* coursesReader(filenames: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const filename of filenames) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const file = await readFile(path.resolve(filepath, filename), { encoding: 'utf-8' });
      const course: Course = JSON.parse(file);
      yield course;
    } catch (error) {
      logger.error(error);
    }
  }
}

const bulkCreateCourses = async () => {
  const dirents = await readdir(filepath, { withFileTypes: true });
  const filenames = dirents.flatMap((dirent) => (dirent.isFile() ? dirent.name : []));
  const fileCount = filenames.length;

  logger.info(`There are ${fileCount} course files in total`);

  const result = await client.helpers.bulk({
    datasource: coursesReader(filenames),
    onDocument(course) {
      return {
        create: {
          _index: defaultIndex,
          _id: course.yearClassId,
        },
      };
    },
  });

  logger.info('Bulk creating courses');
  console.log(result);
};

(async () => {
  try {
    await checkConnection();
    await bulkCreateCourses();
  } catch (error) {
    logger.error(error);
  }
})();
