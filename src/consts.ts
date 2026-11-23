// Global site configuration. Imported anywhere via `import { ... } from '../consts'`.

export const SITE_DESCRIPTION =
  'Software engineer resume and blog by Esteban Saldarriaga Alzate.';

export const AUTHOR = {
  name: 'Esteban Saldarriaga Alzate',
  shortName: 'Esteban',
  jobTitle: 'Senior Software Engineer',
  focus: 'Ruby on Rails · AI Agents & MCP',
  location: 'Colombia',
  city: 'Medellín, Colombia',
  email: 'estebansa@outlook.com',
} as const;

/** The CV PDF, printed from `/cv` at build time by `integrations/snapshots.mjs`. */
export const CV_PDF = '/Esteban-Saldarriaga-CV.pdf';

/** The link-preview image, screenshotted from `/social-card/` at build time. */
export const SOCIAL_CARD = {
  src: '/social-card.png',
  width: 1200,
  height: 630,
  alt: `${AUTHOR.name}, ${AUTHOR.jobTitle}, with every role drawn to scale on a timeline`,
};

export const SOCIALS = [
  { label: 'github', href: 'https://github.com/estebansa19' },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/estebansaldarriaga',
  },
] as const;
