/** The only values a job's `stack` may use; src/content.config.ts enforces it. */
export const SKILL_GROUPS = [
  {
    label: 'Languages & frameworks',
    items: ['Ruby', 'Ruby on Rails', 'RSpec', 'ViewComponent', 'TypeScript', 'JavaScript', 'React', 'Next.js'],
  },
  {
    label: 'Data & infrastructure',
    items: ['PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Sidekiq', 'Docker', 'Google Cloud', 'AWS'],
  },
  {
    label: 'AI tooling',
    items: ['Claude Code', 'Cursor', 'MCP', 'AI Agents'],
  },
] as const;

export type Skill = (typeof SKILL_GROUPS)[number]['items'][number];

export const SKILLS: Skill[] = SKILL_GROUPS.flatMap((group) => group.items);
