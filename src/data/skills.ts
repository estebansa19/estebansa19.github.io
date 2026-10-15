/**
 * Tech stack, grouped for the CV. The resume shows the same list flattened.
 */
export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: 'Languages & frameworks',
    items: ['Ruby', 'Ruby on Rails', 'RSpec', 'ViewComponent', 'TypeScript', 'JavaScript', 'React'],
  },
  {
    label: 'Data & infrastructure',
    items: ['PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Sidekiq', 'Docker', 'Google Cloud', 'AWS'],
  },
  {
    label: 'AI tooling',
    items: ['Claude Code', 'MCP', 'AI Agents'],
  },
];

export const SKILLS: string[] = SKILL_GROUPS.flatMap((group) => group.items);
