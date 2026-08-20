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
		period: 'Sep 2017 — Sep 2019',
	},
	{
		title: 'English — C1 level',
		institution: 'Blendex Academy',
		url: 'https://idiomasblendex.edu.co/',
		period: 'Mar 2022 — Mar 2024',
	},
];
