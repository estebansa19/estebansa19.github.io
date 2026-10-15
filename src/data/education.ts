export interface Education {
  title: string;
  institution: string;
  url?: string;
  period?: string;
  /** English title for the CV; entries without one are left off it. */
  cvTitle?: string;
}

export const EDUCATION: Education[] = [
  {
    title: 'Análisis y Desarrollo de Sistemas de Información',
    cvTitle: 'Technologist in Information Systems Analysis and Development',
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
