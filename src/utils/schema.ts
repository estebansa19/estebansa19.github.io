import type { Job } from './career';
import { toISODate } from './date';

/** The `@id` that ties every page's JSON-LD to the same Person. */
export const personId = (site: URL): string => new URL('/#person', site).href;

/** schema.org puts a past profession's dates on a Role wrapping the Occupation. */
export const occupationRole = (job: Job) => ({
  '@type': 'Role',
  name: `${job.data.role} at ${job.data.company}`,
  startDate: toISODate(job.data.date_start),
  ...(job.data.date_end !== 'present' && { endDate: toISODate(job.data.date_end) }),
  hasOccupation: {
    '@type': 'Occupation',
    name: job.data.role,
    ...(job.data.summary && { description: job.data.summary }),
  },
});
