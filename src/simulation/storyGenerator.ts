import { ProductBrief, UserStory } from '../types';

function slugify(name: string): string {
  const letters = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return (letters.slice(0, 3) || 'APP') + '-';
}

function pickGoals(brief: ProductBrief): string[] {
  const raw = brief.goals
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (raw.length >= 2) return raw.slice(0, 4);
  return [
    `Deliver core value for ${brief.name}`,
    'Ship a reliable MVP users can trust',
    'Keep the experience fast and clear',
  ];
}

export function generateStories(brief: ProductBrief, now: number): UserStory[] {
  const prefix = slugify(brief.name);
  const product = brief.name.trim() || 'Product';
  const constraintHint =
    brief.constraints.trim() || 'Keep scope tight for the first release';
  const goals = pickGoals(brief);
  const descBit = brief.description.trim().slice(0, 80) || 'the product vision';

  const blueprints: Omit<UserStory, 'id' | 'createdAt' | 'status'>[] = [
    {
      key: `${prefix}101`,
      title: `Define success metrics for ${product}`,
      description: `Align the team on what "done" looks like for ${product}, grounded in: ${descBit}.`,
      acceptanceCriteria: [
        'North-star metric and 2 supporting KPIs documented',
        'Non-goals for v1 explicitly listed',
        `Constraints reflected: ${constraintHint.slice(0, 60)}`,
      ],
      points: 3,
      assigneeId: 'aria',
    },
    {
      key: `${prefix}102`,
      title: `Map domain model for ${product}`,
      description: `Capture core entities, relationships, and boundaries so ${product} can grow without rewrites.`,
      acceptanceCriteria: [
        'Entity diagram reviewed by eng + product',
        'Auth, tenancy, and data ownership clarified',
        'Open questions tracked with owners',
      ],
      points: 5,
      assigneeId: 'priya',
    },
    {
      key: `${prefix}103`,
      title: 'Design API surface & contracts',
      description: `Specify the first backend contracts powering ${product} flows.`,
      acceptanceCriteria: [
        'OpenAPI draft for primary resources',
        'Error model and pagination conventions agreed',
        'Idempotency notes for write endpoints',
      ],
      points: 5,
      assigneeId: 'leo',
    },
    {
      key: `${prefix}104`,
      title: 'Craft primary user journey UI',
      description: `Design the hero path that lets users experience ${product} value in under 2 minutes.`,
      acceptanceCriteria: [
        'Wireframes for empty, loading, success, and error states',
        'Accessibility checklist for interactive elements',
        `Supports goal: ${goals[0]}`,
      ],
      points: 5,
      assigneeId: 'sofia',
    },
    {
      key: `${prefix}105`,
      title: 'Sequence sprint 0 / sprint 1 backlog',
      description: `Order stories for ${product} so discovery → architecture → delivery stays coherent.`,
      acceptanceCriteria: [
        'Dependencies and blockers called out',
        'Story points estimated with the team',
        'Sprint goal written in one sentence',
      ],
      points: 3,
      assigneeId: 'marcus',
    },
    {
      key: `${prefix}106`,
      title: 'Auth & session foundation',
      description: `Stand up secure identity plumbing for ${product}.`,
      acceptanceCriteria: [
        'Sign-up / sign-in happy path works end-to-end',
        'Token refresh and logout covered',
        'Threat notes for session storage reviewed',
      ],
      points: 8,
      assigneeId: 'leo',
    },
    {
      key: `${prefix}107`,
      title: 'Build responsive shell & navigation',
      description: `Ship the app chrome users live in while using ${product}.`,
      acceptanceCriteria: [
        'Works on phone, tablet, and web breakpoints',
        'Navigation deep-links to primary screens',
        'Dark theme tokens applied consistently',
      ],
      points: 5,
      assigneeId: 'sofia',
    },
    {
      key: `${prefix}108`,
      title: `Acceptance suite for ${product} MVP`,
      description: 'Translate goals into executable checks and edge cases.',
      acceptanceCriteria: [
        'Happy-path E2E scenarios drafted',
        'Negative / abuse cases listed',
        `Goal covered: ${goals[1] ?? goals[0]}`,
      ],
      points: 5,
      assigneeId: 'jordan',
    },
  ];

  return blueprints.map((b, i) => ({
    ...b,
    id: `story-${i + 1}`,
    status: 'backlog' as const,
    createdAt: now + i * 400,
  }));
}
