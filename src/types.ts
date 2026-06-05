export interface TeamMemberPDI {
  id: string;
  name: string;
  update: string;
}

export interface ProductPlan {
  id: string;
  name: string;
  planned: number;
  realized: number;
}

export interface ActionItem5W2H {
  id: string;
  what: string;
  who: string;
  when: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  why?: string;
}

export interface Meeting {
  id: string;
  weekName: string;
  date: string;
  leader: string;
  shift: string;
  safetyAlert: string;
  oee: number; // Storing the computed or overridden adherence percentage
  qualityApproval: number;
  incidents: number;
  bottleneckProblem: string;
  bottleneckAction: string;
  teamEvolution: TeamMemberPDI[];
  productionPlans?: ProductPlan[]; // List of monthly product plans with planned & realized quantities
  actions5w2h?: ActionItem5W2H[]; // Plano de ação estruturado 5W2H
  teamAlignments?: string; // Informações de alinhamentos que preciso fazer com o time
  createdAt: string;
  updatedAt: string;
}
