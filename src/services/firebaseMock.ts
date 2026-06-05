import { Meeting } from '../types';

const STORAGE_KEY = 'industrial_meetings_history';

// Pre-populated default meetings as realistic historical data
const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: 'meet-18',
    weekName: 'Semana 18 - 01/Maio',
    date: '2026-05-01',
    leader: 'Carlos Silva (Superv. Produção)',
    shift: '1º Turno',
    safetyAlert: '⚠️ Verificado desgaste nos cabos de aço da talha da prensa 03. Manutenção corretiva programada e realizada com sucesso antes da falha. Zero incidentes relatados!',
    oee: 84.5,
    qualityApproval: 98.2,
    incidents: 0,
    bottleneckProblem: 'Gargalo de setup na extrusora principal levou a um atraso de 120 minutos no início da campanha de terça-feira.',
    bottleneckAction: 'Realizado treinamento SMED (Single-Minute Exchange of Die) com a equipe do turno A para otimização da troca de moldes.',
    teamAlignments: '• Focar na limpeza do setor de paletização ao final de cada turno.\n• Reunião de 5 minutos sobre postura de ergonomia antes da operação.\n• Lembrete do preenchimento diário do quadro de paradas.',
    teamEvolution: [
      { id: 'pdi-1', name: 'João Santos', update: 'Iniciou treinamento de operador de empilhadeira avançado.' },
      { id: 'pdi-2', name: 'Maria Souza', update: 'Excelente engajamento no comitê de 5S, liderou auditoria interna.' }
    ],
    productionPlans: [
      { id: 'prod-1a', name: 'Filme Flexível PEBD', planned: 2000, realized: 1690 }
    ],
    actions5w2h: [
      { id: 'act-18-1', what: 'Treinamento SMED na Extrusora', who: 'Carlos Silva', when: '2026-05-05', status: 'Concluído', why: 'Otimizar o setup crítico que causou parada na linha' },
      { id: 'act-18-2', what: 'Substituição preventiva nos cabos de aço', who: 'Equipe de Manutenção', when: '2026-05-02', status: 'Concluído', why: 'Eliminar o degressivo de segurança preventiva' }
    ],
    createdAt: new Date(2026, 4, 1, 14, 0).toISOString(),
    updatedAt: new Date(2026, 4, 1, 14, 0).toISOString()
  },
  {
    id: 'meet-19',
    weekName: 'Semana 19 - 08/Maio',
    date: '2026-05-08',
    leader: 'Mariana Costa (Coord. Qualidade)',
    shift: '2º Turno',
    safetyAlert: '✅ Integração de segurança com 4 novos colaboradores temporários realizada com sucesso. Nenhum desvio de conduta identificado nesta semana.',
    oee: 87.2,
    qualityApproval: 99.1,
    incidents: 0,
    bottleneckProblem: 'Instabilidade de pressão pneumática na linha 02 causando desarmes intermitentes do robô de paletização.',
    bottleneckAction: 'Substituição da válvula reguladora de pressão principal e instalação de um manômetro com alarme visual para monitoramento contínuo.',
    teamAlignments: '• Atenção ao checklist de pressão pneumática da linha 02.\n• Manter canais de comunicação abertos com o supervisor nos desvios de processo.\n• Integração de novos colaboradores temporários.',
    teamEvolution: [
      { id: 'pdi-3', name: 'Roberto Lima', update: 'Completou módulo teórico de programação CNC.' },
      { id: 'pdi-4', name: 'Ana Oliveira', update: 'Demonstrou alta proatividade na resolução de problemas do robo de paletização.' }
    ],
    productionPlans: [
      { id: 'prod-2a', name: 'Bobina de Alumínio 500mm', planned: 1000, realized: 872 }
    ],
    actions5w2h: [
      { id: 'act-19-1', what: 'Instalar reguladora de ar comprimido na Linha 02', who: 'Mecânico Residente', when: '2026-05-12', status: 'Concluído', why: 'Evitar desarmes na paletização automática' },
      { id: 'act-19-2', what: 'Treinar novo operador nas instruções de palete', who: 'Mariana Costa', when: '2026-05-14', status: 'Em Andamento', why: 'Assegurar padronização de embalamento' }
    ],
    createdAt: new Date(2026, 4, 8, 14, 30).toISOString(),
    updatedAt: new Date(2026, 4, 8, 15, 0).toISOString()
  },
  {
    id: 'meet-20',
    weekName: 'Semana 20 - 15/Maio',
    date: '2026-05-15',
    leader: 'Julio Cesar (Gerente de Planta)',
    shift: '3º Turno',
    safetyAlert: '🚨 Alerta: Identificado vazamento de óleo hidráulico na injetora 05. Contenção imediata aplicada com pó absorvente. Nenhuma exposição ou dano corporal.',
    oee: 82.1,
    qualityApproval: 97.4,
    incidents: 1,
    bottleneckProblem: 'Bobina de aquecimento da injetora 05 queimada, gerando parada de máquina por 6 horas.',
    bottleneckAction: 'Definido estoque mínimo de sobressalentes na oficina mecânica para resistências elétricas críticas de todas as injetoras.',
    teamAlignments: '• Revisar procedimentos de contenção rápida para vazamentos hidráulicos.\n• Organização geral da prensa e injetoras com foco em vazamentos.\n• Alinhamento sobre plano de estoque crítico na oficina.',
    teamEvolution: [
      { id: 'pdi-5', name: 'Lucas Mendes', update: 'Aprovado para operations autônomas de baixa complexidade.' }
    ],
    productionPlans: [
      { id: 'prod-3a', name: 'Embalagem Pouch StandUp', planned: 1500, realized: 1231.5 }
    ],
    actions5w2h: [
      { id: 'act-20-1', what: 'Cadastrar resistências adicionais no estoque SAP', who: 'Equipe Almoxarifado', when: '2026-05-18', status: 'Pendente', why: 'Evitar parada de 6h na quebra de resistências' },
      { id: 'act-20-2', what: 'Limpeza e contenção física do vazamento de óleo na injetora 05', who: 'Operador Lucas Mendes', when: '2026-05-16', status: 'Concluído', why: 'Mitigar risco de queda e sujeira na área' }
    ],
    createdAt: new Date(2026, 4, 15, 10, 0).toISOString(),
    updatedAt: new Date(2026, 4, 15, 11, 15).toISOString()
  }
];

// Seed storage with defaults if nothing exists
const getStoredMeetings = (): Meeting[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEETINGS));
    return DEFAULT_MEETINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_MEETINGS;
  }
};

const saveStoredMeetings = (meetings: Meeting[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
};

/**
 * Simulando as chamadas assíncronas do Firebase Firestore.
 * Quando o cliente integrar o Firebase de fato, bastará reescrever esses métodos utilizando:
 * import { collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
 */

export const firebaseMockService = {
  /**
   * Busca todo o histórico de reuniões
   */
  fetchHistory: async (): Promise<Meeting[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = getStoredMeetings();
        // Ordena por data decrescente (mais recente primeiro)
        const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(sorted);
      }, 600); // 600ms de delay simulando requisição de rede
    });
  },

  /**
   * Salva uma nova reunião
   */
  saveMeeting: async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const meetings = getStoredMeetings();
        const newMeeting: Meeting = {
          ...meeting,
          id: `meet-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        meetings.push(newMeeting);
        saveStoredMeetings(meetings);
        resolve(newMeeting);
      }, 500);
    });
  },

  /**
   * Atualiza uma reunião existente
   */
  updateMeeting: async (id: string, updatedFields: Partial<Meeting>): Promise<Meeting> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const meetings = getStoredMeetings();
        const index = meetings.findIndex((m) => m.id === id);
        if (index === -1) {
          reject(new Error('Reunião não encontrada no banco.'));
          return;
        }

        const updatedMeeting: Meeting = {
          ...meetings[index],
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };

        meetings[index] = updatedMeeting;
        saveStoredMeetings(meetings);
        resolve(updatedMeeting);
      }, 500);
    });
  },

  /**
   * Deleta uma reunião
   */
  deleteMeeting: async (id: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const meetings = getStoredMeetings();
        const index = meetings.findIndex((m) => m.id === id);
        if (index === -1) {
          reject(new Error('Reunião não encontrada para exclusão.'));
          return;
        }

        meetings.splice(index, 1);
        saveStoredMeetings(meetings);
        resolve(true);
      }, 500);
    });
  },
};
