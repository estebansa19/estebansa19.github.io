import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const jobsDirectory = path.join(process.cwd(), 'jobs');

export function getSortedJobsData() {
  // Get file names under /jobs
  const fileNames = fs.readdirSync(jobsDirectory);

  const allJobsData = fileNames.map((fileName) => {
    // Remove .md from the file to get the id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(jobsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    };
  });

  return allJobsData.sort((a, b) => {
    if (a.date_start < b.date_start) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllJobsIds() {
  const fileNames = fs.readdirSync(jobsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'job1'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'job2'
  //     }
  //   }
  // ]

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      }
    }
  });
}

export async function getJobData(id) {
  const fullPath = path.join(jobsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf-8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data
  };
}
