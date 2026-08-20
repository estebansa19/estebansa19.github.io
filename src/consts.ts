// Global site configuration. Imported anywhere via `import { ... } from '../consts'`.

export const SITE_TITLE = "Esteban's Website";
export const SITE_DESCRIPTION =
	'Software engineer resume and blog by Esteban Saldarriaga Alzate.';

export const AUTHOR = {
	name: 'Esteban Saldarriaga Alzate',
	shortName: 'Esteban',
	jobTitle: 'Senior Software Engineer',
	location: 'Colombia',
	birthDate: '2000-05-08',
} as const;

export const SOCIALS = [
	{ label: 'GitHub', href: 'https://github.com/estebansa19' },
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/esteban-saldarriaga-alzate-77a076177',
	},
] as const;

/** `<title>` for every page except the home page, which uses its own full title. */
export const titleTemplate = (title: string) => `${title} — ${AUTHOR.shortName}`;
