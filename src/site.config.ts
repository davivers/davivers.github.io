// ============================================================
//  Edit here: name, home page texts and links.
//  Types live in `src/types.ts`.
// ============================================================

import type { NavItem, SiteConfig } from './types';

export const site = {
  name: 'David Lima',
  role: 'Security Engineer · Detection Engineering · Blue Team',
  location: 'Fortaleza, Brasil',
  greeting: 'Olá! Sou engenheiro de segurança da informação em Fortaleza, Brasil.',
  description:
    'Portfólio e write-ups de David Lima — detection engineering, SOC e blue team.',

  work: [
    'Engenheiro de segurança com mais de 4 anos em SOC, detection engineering e monitoramento. Construo e opero SIEM em larga escala, escrevo regras de detecção, decoders e integrações, e automatizo o que der com Python, PowerShell e Bash.',
    'Hoje estou focado em Detection-as-Code: regras versionadas, testadas e entregues por CI/CD.',
  ],

  timeline: [
    { year: '2020', text: 'Ingressa em Sistemas de Informação na Unifametro' },
    { year: '2022', text: 'SOC Trainee na Trust Control, em Fortaleza' },
    { year: '2023', text: 'Analista de Segurança Júnior na Trust Control' },
    { year: '2024', text: 'Analista de Segurança Pleno na TP' },
    { year: '2024', text: 'Conclui o bacharelado em Sistemas de Informação' },
    { year: '2025', text: 'Analista de Segurança na Scunna — SIEM Wazuh em larga escala' },
    { year: '2026', text: 'Aberto a novas oportunidades remotas em Detection Engineering' },
  ],

  loves: [
    'Detection engineering',
    'Threat hunting',
    'Automação com Python',
    'Open source',
    'Wazuh, Sigma e Sysmon',
  ],

  // An empty `url` hides the link.
  links: [
    { label: '@davivers', url: 'https://github.com/davivers', icon: 'github' },
    { label: 'LinkedIn', url: '', icon: 'linkedin' }, // TODO: https://www.linkedin.com/in/<your-handle>
    { label: 'E-mail', url: '', icon: 'mail' }, // TODO: mailto:<your-email>
  ],

  sourceUrl: 'https://github.com/davivers/davivers.github.io',
} satisfies SiteConfig;

export const nav = [
  { href: '/projetos/', label: 'Projetos' },
  { href: '/blog/', label: 'Blog' },
] satisfies NavItem[];
