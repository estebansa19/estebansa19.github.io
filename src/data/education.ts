export interface Education {
	title: string;
	institution: string;
	url?: string;
	period?: string;
}

export const EDUCATION: Education[] = [
	{
		title: 'Análisis y Desarrollo de Sistemas de Información',
		institution: 'SENA',
		url: 'https://senacertificados.co/analisis-desarrollo-de-sistemas-de-informacion/',
		period: 'September 2017 — September 2019',
	},
	{
		title: 'English — C1 level',
		institution: 'Blendex Academy',
		url: 'https://idiomasblendex.edu.co/',
	},
];
