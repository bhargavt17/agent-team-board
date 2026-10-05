import { AgentDef } from '../types';

export const TEAM: AgentDef[] = [
  {
    id: 'aria',
    name: 'Aria Chen',
    role: 'director',
    title: 'Director',
    badge: 'VISION',
    initials: 'AC',
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'manager',
    title: 'Engineering Manager',
    badge: 'PLAN',
    initials: 'MW',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'architect',
    title: 'Architect',
    badge: 'SYS',
    initials: 'PN',
  },
  {
    id: 'leo',
    name: 'Leo Park',
    role: 'backend',
    title: 'Backend Dev',
    badge: 'API',
    initials: 'LP',
  },
  {
    id: 'sofia',
    name: 'Sofia Reyes',
    role: 'frontend',
    title: 'Frontend Dev',
    badge: 'UI',
    initials: 'SR',
  },
  {
    id: 'jordan',
    name: 'Jordan Blake',
    role: 'qa',
    title: 'QA / Tester',
    badge: 'QA',
    initials: 'JB',
  },
];

export const STAGES = [
  { id: 'discovery' as const, label: 'Discovery', short: '01' },
  { id: 'architecture' as const, label: 'Architecture', short: '02' },
  { id: 'story_breakdown' as const, label: 'Story breakdown', short: '03' },
  { id: 'planning' as const, label: 'Planning', short: '04' },
  { id: 'implementation' as const, label: 'Impl. kickoff', short: '05' },
  { id: 'qa_planning' as const, label: 'QA planning', short: '06' },
];

export function getAgent(id: string): AgentDef {
  return TEAM.find((a) => a.id === id) ?? TEAM[0];
}
