import { getCollection, type CollectionEntry } from 'astro:content';
import { monthsBetween } from './date';

export type Job = CollectionEntry<'jobs'>;

/** Every role, newest first. */
export async function getJobs(): Promise<Job[]> {
  const jobs = await getCollection('jobs');
  return jobs.sort((a, b) => b.data.date_start.getTime() - a.data.date_start.getTime());
}

export const endOf = (job: Job): Date => (job.data.date_end === 'present' ? new Date() : job.data.date_end);

export const tenureOf = (job: Job): number => monthsBetween(job.data.date_start, endOf(job));
