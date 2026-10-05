export type AgentRole =
  | 'director'
  | 'manager'
  | 'architect'
  | 'backend'
  | 'frontend'
  | 'qa';

export type AgentStatus =
  | 'Thinking'
  | 'Writing'
  | 'Reviewing'
  | 'Idle'
  | 'Blocked'
  | 'Speaking';

export type StoryStatus = 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';

export type StageId =
  | 'discovery'
  | 'architecture'
  | 'story_breakdown'
  | 'planning'
  | 'implementation'
  | 'qa_planning'
  | 'complete';

export interface ProductBrief {
  name: string;
  description: string;
  goals: string;
  constraints: string;
}

export interface AgentDef {
  id: string;
  name: string;
  role: AgentRole;
  title: string;
  badge: string;
  initials: string;
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask: string;
}

export interface UserStory {
  id: string;
  key: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  points: number;
  assigneeId: string;
  status: StoryStatus;
  createdAt: number;
}

export interface ActivityItem {
  id: string;
  agentId: string;
  message: string;
  timestamp: number;
  kind: 'chat' | 'system' | 'story' | 'status';
}

export interface SimulationState {
  brief: ProductBrief;
  stage: StageId;
  stageIndex: number;
  startedAt: number;
  agents: Record<string, AgentState>;
  stories: UserStory[];
  activity: ActivityItem[];
  progress: number;
  running: boolean;
}
