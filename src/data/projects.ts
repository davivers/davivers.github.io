// ============================================================
//  Cards of the "Projetos" page. See `Project` in `src/types.ts`.
//  `hue` sets the color of the generated cover (0–360).
//  To use your own picture, put it in `public/` and fill `image`.
// ============================================================

import type { Project } from '../types';

export type { Project };

export const projects: Project[] = [
  {
    title: 'Vitrix',
    summary:
      'Plataforma open source de Detection-as-Code: valida e converte regras entre SIEMs, integrada ao seu Git e CI/CD.',
    tags: ['Python', 'React', 'CI/CD'],
    url: 'https://github.com/davivers/vitrix',
    hue: 265,
    glyph: '{ }',
  },
  {
    title: 'Lab de Detection-as-Code',
    summary:
      'Lab em cloud com Wazuh, Sysmon e Atomic Red Team para escrever, testar e versionar regras de detecção.',
    tags: ['Wazuh', 'Sysmon', 'Atomic Red Team'],
    // url: 'https://github.com/davivers/dac-lab', // TODO: uncomment when the repo is public
    hue: 165,
    glyph: '⟁',
  },
  {
    title: 'wazuh_monitor',
    summary:
      'Monitor de saúde de cluster Wazuh com recuperação automática de nós.',
    tags: ['Python', 'Wazuh', 'Automação'],
    // url: 'https://github.com/davivers/wazuh-monitor', // TODO: uncomment when the repo is public
    hue: 25,
    glyph: '◎',
  },
];
