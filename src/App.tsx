import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Monitor, 
  Shrink, 
  Activity, 
  Award, 
  CheckCircle,
  FileText,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock3,
  X,
  AlertCircle,
  Package,
  BarChart3,
  ListTodo,
  DollarSign,
  Play,
  Pause,
  Copy,
  Info,
  ChevronLeft,
  Briefcase,
  Megaphone
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { firebaseMockService } from './services/firebaseMock';
import { Meeting, TeamMemberPDI, ProductPlan, ActionItem5W2H } from './types';

// Helper to parse operator recognition categories
interface ParsedRecognition {
  badge: {
    label: string;
    bg: string;
    text: string;
    border: string;
  };
  cleanText: string;
}

const parseRecognition = (updateStr: string): ParsedRecognition => {
  const categories = [
    { prefix: '[Destaque ⭐]', label: 'Destaque ⭐', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    { prefix: '[Feedback 👍]', label: 'Feedback 👍', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    { prefix: '[Ideia 💡]', label: 'Inovação 💡', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    { prefix: '[Melhoria 🌱]', label: 'Desenvolvimento 🌱', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    { prefix: '[Postura 🛡️]', label: 'Segurança / Postura 🛡️', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  ];

  for (const cat of categories) {
    if (updateStr && updateStr.startsWith(cat.prefix)) {
      return {
        badge: { label: cat.label, bg: cat.bg, text: cat.text, border: cat.border },
        cleanText: updateStr.substring(cat.prefix.length).trim(),
      };
    }
  }

  return {
    badge: { label: 'Reconhecimento 🌟', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
    cleanText: updateStr,
  };
};

export default function App() {
  //--- STATE VARIABLES ---
  const [history, setHistory] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  
  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 5 Premium Routine Enhancement States
  const [activeTab, setActiveTab] = useState<'meeting' | 'analytics' | 'actions' | 'roi'>('meeting');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'shifts' | 'actions' | 'bottlenecks' | 'team'>('shifts');

  // structured Action Plans states
  const [actions5w2h, setActions5w2h] = useState<ActionItem5W2H[]>([]);
  const [newActionWhat, setNewActionWhat] = useState<string>('');
  const [newActionWho, setNewActionWho] = useState<string>('');
  const [newActionWhen, setNewActionWhen] = useState<string>('2026-05-25');
  const [newActionWhy, setNewActionWhy] = useState<string>('');

  // Timer counter (standup meeting countdown)
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Loss Parameter Configs
  const [costPerUnit, setCostPerUnit] = useState<number>(18);
  const [machineHourCost, setMachineHourCost] = useState<number>(300);
  const [scrapCostPercentage, setScrapCostPercentage] = useState<number>(500);

  // Presentation Deck slides navigation
  const [presentationSlide, setPresentationSlide] = useState<number>(0);
  const [autoPlaySlides, setAutoPlaySlides] = useState<boolean>(false);

  // Form Fields
  const [date, setDate] = useState<string>('2026-05-20');
  const [leader, setLeader] = useState<string>('');
  const [shift, setShift] = useState<string>('1º Turno');
  const [safetyAlert, setSafetyAlert] = useState<string>('');
  const [teamAlignments, setTeamAlignments] = useState<string>('');
  const [oee, setOee] = useState<number>(85); // Storing overall production plan adherence
  const [qualityApproval, setQualityApproval] = useState<number>(98);
  const [incidents, setIncidents] = useState<number>(0);
  const [bottleneckProblem, setBottleneckProblem] = useState<string>('');
  const [bottleneckAction, setBottleneckAction] = useState<string>('');
  const [teamEvolution, setTeamEvolution] = useState<TeamMemberPDI[]>([]);
  const [productionPlans, setProductionPlans] = useState<ProductPlan[]>([]);

  // Temp fields for adding team evolution member
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberUpdate, setNewMemberUpdate] = useState<string>('');
  const [newMemberCategory, setNewMemberCategory] = useState<string>('[Destaque ⭐]');

  // Delete Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  //--- FETCH HISTORY ON LOAD ---
  const loadHistory = async (autoSelectLatest = true) => {
    setIsLoading(true);
    try {
      const data = await firebaseMockService.fetchHistory();
      setHistory(data);
      if (autoSelectLatest && data.length > 0) {
        handleSelectMeeting(data[0]);
      }
    } catch (err) {
      showToast('Erro ao carregar histórico de reuniões.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(true);
  }, []);

  // Dynamically calculate average adherence if there are products in the list
  useEffect(() => {
    if (productionPlans && productionPlans.length > 0) {
      const totalPlanned = productionPlans.reduce((sum, p) => sum + (Number(p.planned) || 0), 0);
      const totalRealized = productionPlans.reduce((sum, p) => sum + (Number(p.realized) || 0), 0);
      if (totalPlanned > 0) {
        // Safe round to 1 decimal place
        const calculatedAdherence = Math.round((totalRealized / totalPlanned) * 100 * 10) / 10;
        setOee(calculatedAdherence);
      } else {
        setOee(0);
      }
    }
  }, [productionPlans]);

  // Countdown clock effect for standup meetings
  useEffect(() => {
    let intervalId: any;
    if (timerRunning && timerSeconds > 0) {
      intervalId = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            showToast('Tempo limite do Standup atingido! Favor consolidar ações.', 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerRunning, timerSeconds]);

  // Auto-slide carousel in presentation mode for shopfloor dashboard TVs
  useEffect(() => {
    let intervalId: any;
    if (isPresentationMode && autoPlaySlides) {
      intervalId = setInterval(() => {
        setPresentationSlide((prev) => (prev + 1) % 4);
      }, 10000); // cycle slide every 10 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPresentationMode, autoPlaySlides]);

  // Utility toast system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  //--- LOAD SELECTED MEETING INTO STATE ---
  const handleSelectMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDate(meeting.date);
    setLeader(meeting.leader);
    setShift(meeting.shift);
    setSafetyAlert(meeting.safetyAlert);
    setTeamAlignments(meeting.teamAlignments || '');
    setOee(meeting.oee);
    setQualityApproval(meeting.qualityApproval);
    setIncidents(meeting.incidents);
    setBottleneckProblem(meeting.bottleneckProblem);
    setBottleneckAction(meeting.bottleneckAction);
    setTeamEvolution(meeting.teamEvolution || []);
    setProductionPlans(meeting.productionPlans || []);
    setActions5w2h(meeting.actions5w2h || []);
    // Clear temp team additions
    setNewMemberName('');
    setNewMemberUpdate('');
    // Close sidebar on mobile
    setMobileSidebarOpen(false);
  };

  //--- INITIALIZE NEW MEETING FORM ---
  const handleNewMeeting = () => {
    setSelectedMeeting(null);
    // Dynamic default week name calculated inside save based on the chosen date
    setDate(new Date().toISOString().substring(0, 10));
    setLeader('');
    setShift('1º Turno');
    setSafetyAlert('');
    setTeamAlignments('');
    setOee(0);
    setQualityApproval(98);
    setIncidents(0);
    setBottleneckProblem('');
    setBottleneckAction('');
    setTeamEvolution([]);
    setProductionPlans([]);
    setActions5w2h([]);
    setNewMemberName('');
    setNewMemberUpdate('');
    setNewMemberCategory('[Destaque ⭐]');
    showToast('Formulário preparado para nova reunião semanal!', 'info');
  };

  //--- ADD TEAM EVO MEMBER TO TEMP LIST ---
  const handleAddTeamMember = () => {
    if (!newMemberName.trim()) {
      showToast('Por favor, informe o nome do colaborador.', 'error');
      return;
    }
    if (!newMemberUpdate.trim()) {
      showToast('Por favor, descreva o motivo do reconhecimento ou feedback.', 'error');
      return;
    }

    const newItem: TeamMemberPDI = {
      id: `team-${Date.now()}`,
      name: newMemberName.trim(),
      update: `${newMemberCategory} ${newMemberUpdate.trim()}`,
    };

    setTeamEvolution([...teamEvolution, newItem]);
    setNewMemberName('');
    setNewMemberUpdate('');
    showToast('Reconhecimento / Feedback registrado para o colaborador!', 'success');
  };

  //--- REMOVE TEAM EVO MEMBER FROM TEMP LIST ---
  const handleRemoveTeamMember = (id: string) => {
    setTeamEvolution(teamEvolution.filter(item => item.id !== id));
    showToast('Colaborador removido da pauta.', 'info');
  };

  //--- SAVE OR UPDATE MEETING ---
  const handleSaveOrUpdate = async () => {
    if (!leader.trim()) {
      showToast('O nome do Líder da reunião é obrigatório.', 'error');
      return;
    }
    if (!date) {
      showToast('A data da reunião é obrigatória.', 'error');
      return;
    }

    // Generate readable weekName (e.g., "Semana 21 - 22/Mai" based on date chosen)
    const formattedDate = new Date(date);
    // Get week number from date coordinate
    const firstJan = new Date(formattedDate.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((formattedDate.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((numberOfDays + firstJan.getDay() + 1) / 7);

    const monthNamesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dayFixed = date.split('-')[2] || String(formattedDate.getDate());
    const monthIndex = parseInt(date.split('-')[1]) - 1 || formattedDate.getMonth();
    const monthPt = monthNamesPt[monthIndex] || 'Mes';
    const weekName = `Semana ${weekNumber} - ${dayFixed}/${monthPt}`;

    const dataPayload = {
      weekName,
      date,
      leader: leader.trim(),
      shift,
      safetyAlert: safetyAlert.trim(),
      teamAlignments: teamAlignments.trim(),
      oee: Number(oee) || 0,
      qualityApproval: Number(qualityApproval) || 0,
      incidents: Number(incidents) || 0,
      bottleneckProblem: bottleneckProblem.trim(),
      bottleneckAction: bottleneckAction.trim(),
      teamEvolution,
      productionPlans,
      actions5w2h,
    };

    setIsSaving(true);
    try {
      if (selectedMeeting) {
        // UPDATE EXISTING
        const updated = await firebaseMockService.updateMeeting(selectedMeeting.id, dataPayload);
        showToast('Reunião atualizada com sucesso no histórico!', 'success');
        // Refresh local listing but keep editing state pointed to updated
        const updatedHistory = await firebaseMockService.fetchHistory();
        setHistory(updatedHistory);
        setSelectedMeeting(updated);
      } else {
        // CREATE NEW
        const created = await firebaseMockService.saveMeeting(dataPayload);
        showToast('Nova reunião salva e registrada com sucesso!', 'success');
        const updatedHistory = await firebaseMockService.fetchHistory();
        setHistory(updatedHistory);
        setSelectedMeeting(created);
      }
    } catch (err) {
      showToast('Erro ao gravar dados da reunião.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  //--- TRIGGER DELETION OF SELECTED REUNION ---
  const triggerDelete = () => {
    if (!selectedMeeting) return;
    setMeetingToDelete(selectedMeeting);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;
    setIsSaving(true);
    setIsDeleteModalOpen(false);
    try {
      await firebaseMockService.deleteMeeting(meetingToDelete.id);
      showToast('Reunião excluída do histórico com sucesso.', 'success');
      setMeetingToDelete(null);
      
      // Reload history and automatically select the first item left
      const nextHistory = await firebaseMockService.fetchHistory();
      setHistory(nextHistory);
      if (nextHistory.length > 0) {
        handleSelectMeeting(nextHistory[0]);
      } else {
        // If empty history, reset form to empty "new meeting" state
        handleNewMeeting();
      }
    } catch (err) {
      showToast('Erro ao excluir reunião.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- EXPORT FORMATTED WhatsApp/Teams REPORT ---
  const handleCopyFormattedReport = () => {
    if (!leader) {
      showToast('Preencha a liderança para exportar o sumário formatado.', 'error');
      return;
    }
    
    let text = `📢  *PAUTA OPERACIONAL DE ALTA PERFORMANCE - PRODLOGIC*  📢\n`;
    text += `📅 *Semana*: ${selectedMeeting?.weekName || 'Nova Pauta'} | *Data*: ${date.split('-').reverse().join('/')}\n`;
    text += `👤 *Facilitador / Líder*: ${leader} | 🕒 *Turno*: ${shift}\n`;
    text += `--------------------------------------------------------\n\n`;
    
    if (teamAlignments) {
      text += `📢  *ALINHAMENTOS COM O TIME*:\n`;
      text += `${teamAlignments}\n`;
      text += `--------------------------------------------------------\n\n`;
    }

    if (safetyAlert) {
      text += `🛡️  *DSS / SEGURANÇA E HIGIENE*:\n`;
      text += `"${safetyAlert}"\n`;
      text += `--------------------------------------------------------\n\n`;
    }

    text += `⚠️  *GARGALO DE PROCESSO & DESVIOS CRÍTICOS*:\n`;
    text += `*Desvio*: ${bottleneckProblem || 'Nenhum desvio ou obstáculo crítico registrado na pauta.'}\n`;
    text += `--------------------------------------------------------\n\n`;

    if (actions5w2h && actions5w2h.length > 0) {
      text += `📋  *PLANO DE AÇÃO E CONTRAMEDIDAS (5W2H)*:\n`;
      actions5w2h.forEach((a, i) => {
        text += `${i + 1}. [${a.status}] O que: ${a.what} | Quem: ${a.who} | Prazo: ${a.when.split('-').reverse().slice(0, 2).join('/')}\n`;
      });
      text += `--------------------------------------------------------\n\n`;
    }

    if (teamEvolution && teamEvolution.length > 0) {
      text += `👥  *RECONHECIMENTOS & FEEDBACKS DO TIME*:\n`;
      teamEvolution.forEach(t => {
        const parsed = parseRecognition(t.update);
        text += `- *${t.name}* [${parsed.badge.label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}]: "${parsed.cleanText}"\n`;
      });
      text += `--------------------------------------------------------\n`;
    }

    text += `\n*Gerado via Plataforma ProdLogic. Comunicação Operacional Ágil.*`;

    navigator.clipboard.writeText(text);
    showToast('Sumário operacional copiado com sucesso! Prontinho para colar.', 'success');
  };

  // --- structured 5W2H ACTION PLANS HELPERS ---
  const handleAddAction5W2H = () => {
    if (!newActionWhat.trim()) {
      showToast('O campo "O Que" (Ação) é obrigatório.', 'error');
      return;
    }
    if (!newActionWho.trim()) {
      showToast('O campo "Quem" (Responsável) é obrigatório.', 'error');
      return;
    }

    const newAction: ActionItem5W2H = {
      id: `act-${Date.now()}`,
      what: newActionWhat.trim(),
      who: newActionWho.trim(),
      when: newActionWhen,
      why: newActionWhy.trim() || undefined,
      status: 'Pendente'
    };

    setActions5w2h([...actions5w2h, newAction]);
    setNewActionWhat('');
    setNewActionWho('');
    setNewActionWhy('');
    showToast('Ação de contramedida adicionada!', 'success');
  };

  const handleToggleActionStatus = (id: string) => {
    const updated = actions5w2h.map((act) => {
      if (act.id === id) {
        let nextStatus: 'Pendente' | 'Em Andamento' | 'Concluído' = 'Pendente';
        if (act.status === 'Pendente') nextStatus = 'Em Andamento';
        else if (act.status === 'Em Andamento') nextStatus = 'Concluído';
        return { ...act, status: nextStatus };
      }
      return act;
    });
    setActions5w2h(updated);
    showToast('Status da contramedida atualizado!', 'success');
  };

  const handleRemoveAction5W2H = (id: string) => {
    setActions5w2h(actions5w2h.filter((act) => act.id !== id));
    showToast('Ação removida.', 'info');
  };

  //--- DYNAMIC COLORS CALCULATORS ---
  const getAdherenceColor = (val: number) => {
    if (val >= 90) return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      label: 'Classe A (Excelente)'
    };
    if (val >= 80) return {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      label: 'Classe B (Atenção)'
    };
    return {
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      label: 'Classe C (Crítico)'
    };
  };

  const getQualColor = (val: number) => {
    if (val >= 98) return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      label: 'Meta Atingida'
    };
    if (val >= 95) return {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      label: 'Tolerância Técnico-Operacional'
    };
    return {
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      label: 'Abaixo da Margem de Qualidade'
    };
  };

  const getIncidentsColor = (val: number) => {
    if (val === 0) return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      label: 'Planta Segura (Zero Acidentes)'
    };
    return {
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      label: 'Análise de Causa Coletiva Necessária'
    };
  };

  // Filter history based on search query
  const filteredHistory = history.filter(item => 
    item.weekName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.shift.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderKanbanCard = (a: ActionItem5W2H) => (
    <div key={a.id} className="p-4 bg-[#141824] border border-[#232938] rounded-xl relative hover:border-slate-550 transition group flex flex-col gap-3 text-left">
      <div>
        <div className="flex justify-between items-start gap-3">
          <span className="font-semibold text-slate-100 text-xs block leading-relaxed pr-6">{a.what}</span>
          <button 
            type="button"
            onClick={() => handleRemoveAction5W2H(a.id)}
            className="absolute top-3 right-3 text-slate-500 hover:text-rose-450 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {a.why && (
          <p className="text-[10px] text-slate-500 italic mt-1 leading-normal">
            Motivo: "{a.why}"
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800 text-[10px]">
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Quem fará:</span>
          <span className="font-bold text-slate-350 font-sans">{a.who}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Prazo contratado:</span>
          <span className="font-bold text-cyan-400 font-mono">{a.when ? a.when.split('-').reverse().join('/') : 'S/P'}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleToggleActionStatus(a.id)}
        className="w-full bg-slate-850 hover:bg-slate-800 text-[10px] py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white font-medium flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer mt-1"
      >
        <span>Mudar Status para:</span>
        <span className="font-bold text-cyan-400 uppercase tracking-wider">
          {a.status === 'Pendente' ? 'Em Execução' : a.status === 'Em Andamento' ? 'Concluído' : 'A Fazer'}
        </span>
      </button>
    </div>
  );

  const renderTrendsChart = () => {
    const chartHistory = [...history].reverse(); // oldest first
    if (chartHistory.length < 2) {
      return (
        <div className="h-48 flex flex-col items-center justify-center border border-slate-800 rounded-lg bg-slate-950/20 text-slate-500 text-xs p-4">
          <Info className="w-5 h-5 text-cyan-500 mb-2" />
          <span>Mantenha ao menos 2 reuniões no histórico para visualizar as curvas de tendência acumulada.</span>
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 20;

    const steps = chartHistory.length - 1;
    const stepX = (width - paddingX * 2) / steps;

    const adherencePoints = chartHistory.map((h, i) => {
      const x = paddingX + i * stepX;
      const y = height - paddingY - (h.oee / 100) * (height - paddingY * 2);
      return `${x},${y}`;
    }).join(' ');

    const qualityPoints = chartHistory.map((h, i) => {
      const x = paddingX + i * stepX;
      const y = height - paddingY - (h.qualityApproval / 100) * (height - paddingY * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={paddingX} y1={(height / 2)} x2={width - paddingX} y2={(height / 2)} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" />

          <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="fill-slate-500 font-mono text-[9px] font-bold">100%</text>
          <text x={paddingX - 10} y={height / 2 + 4} textAnchor="end" className="fill-slate-500 font-mono text-[9px] font-bold">50%</text>
          <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" className="fill-slate-500 font-mono text-[9px] font-bold">0%</text>

          <polyline fill="none" stroke="#22d3ee" strokeWidth="2.5" points={adherencePoints} strokeLinecap="round" strokeLinejoin="round" />
          <polyline fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,2" points={qualityPoints} strokeLinecap="round" strokeLinejoin="round" />

          {chartHistory.map((h, i) => {
            const x = paddingX + i * stepX;
            const yAdh = height - paddingY - (h.oee / 100) * (height - paddingY * 2);
            const yQual = height - paddingY - (h.qualityApproval / 100) * (height - paddingY * 2);

            return (
              <g key={h.id}>
                <circle cx={x} cy={yAdh} r="4" className="fill-[#0c0f14] stroke-cyan-400 stroke-2 cursor-help" />
                <circle cx={x} cy={yQual} r="3" className="fill-[#0c0f14] stroke-purple-400 stroke-2 cursor-help" />

                <text x={x} y={height - 4} textAnchor="middle" className="fill-slate-400 font-mono text-[8px] font-bold">
                  {h.weekName.split(' ')[1] || `S${i+18}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col antialiased select-none border border-slate-800">
      
      {/* --- FLOATING TOAST SYSTEM --- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-sm max-w-sm backdrop-blur-md"
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(6, 78, 59, 0.9)' : toast.type === 'error' ? 'rgba(127, 29, 29, 0.9)' : 'rgba(30, 41, 59, 0.9)',
              borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(148, 163, 184, 0.3)',
            }}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <FileText className="w-5 h-5 text-sky-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION DELETE MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && meetingToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121620] border border-rose-500/30 w-full max-w-md rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-100">Confirmar Exclusão</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Você está prestes a excluir definitivamente o registro da <strong className="text-gray-200">{meetingToDelete.weekName}</strong> conduzida por <strong className="text-gray-200">{meetingToDelete.leader}</strong>. Essa ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg text-sm bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- APP HEADER --- */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
            <Layers className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold uppercase tracking-wider text-white">
                Painel de Reunião de Alta Performance
              </h1>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 font-mono px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                PRODLOGIC V2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão de Rotina Semanal de Produção e KPIs Operacionais • Danilo Henrique
            </p>
          </div>
        </div>

        {/* Presentation Toggle & Header utilities */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right mr-2">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5 text-cyan-400" /> 
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">20 de Maio de 2026</span>
          </div>

          <button
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border active:scale-95 transition-all shadow-md ${
              isPresentationMode 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-750'
            }`}
            title="Alternar Modo Apresentação"
            id="toggle-presentation-btn"
          >
            {isPresentationMode ? (
              <>
                <Shrink className="w-4 h-4" />
                <span className="hidden sm:inline">MODO EDIÇÃO</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">MODO APRESENTAÇÃO</span>
              </>
            )}
          </button>

          {/* Mobile Sidebar Hamburger button */}
          <button 
            type="button"
            className="md:hidden bg-gray-800 border border-gray-700 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <Search className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </header>

      {/* --- MAIN PAGE CONTENT LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- BARRA LATERAL (SIDEBAR) --- */}
        <aside className={`
          absolute z-40 md:relative md:z-10
          w-80 h-full border-r border-slate-800 bg-slate-900 flex flex-col shrink-0 transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-5 border-b border-slate-800 flex flex-col gap-4 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-widest text-white uppercase text-sm font-display">ProdLogic <span className="text-cyan-500 font-mono text-xs">v2.4</span></span>
            </div>

            {/* BUTTON NEW MEETING */}
            <button
              onClick={handleNewMeeting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 transition-all text-xs tracking-wider cursor-pointer font-display"
            >
              <Plus className="w-4 h-4" />
              NOVA REUNIÃO
            </button>

            {/* SEARCH CRITERIA */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar histórico..."
                className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:border-slate-700 focus:outline-none placeholder-slate-600 font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* HISTORIC SCROLL LIST */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-display">Histórico de Reuniões</span>
              <span className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800 font-mono font-bold">
                {filteredHistory.length} ITENS
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-[11px] text-slate-500 font-mono">Carregando dados...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center px-4">
                <p className="text-xs text-slate-500">Nenhum registro localizado no banco.</p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = selectedMeeting?.id === item.id;
                const adherenceClass = getAdherenceColor(item.oee);
                const qualityClass = getQualColor(item.qualityApproval);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMeeting(item)}
                    className={`w-full text-left p-3.5 transition-all duration-150 cursor-pointer flex flex-col gap-2 rounded-lg ${
                      isSelected 
                        ? 'bg-slate-800 border-l-4 border-cyan-500 rounded-r shadow-md' 
                        : 'bg-slate-900 border border-slate-800/80 hover:bg-slate-850 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-display text-xs font-bold block truncate max-w-[160px] ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.weekName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {item.date.split('-').reverse().slice(0, 2).join('/')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <User className="w-3 h-3 text-slate-500 mr-0.5" />
                      <span className="truncate max-w-[150px] font-medium">{item.leader.split(' ')[0]}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-400 text-[10px] italic">{item.shift}</span>
                    </div>

                    {/* Small preview of KPIs in sidebar card */}
                    <div className="flex gap-2 pt-1.5 border-t border-slate-800/60">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-slate-500" />
                        <span className={`text-[10px] font-mono font-semibold ${adherenceClass.text}`}>
                          Ader. {item.oee}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-slate-500" />
                        <span className={`text-[10px] font-mono font-semibold ${qualityClass.text}`}>
                          QL {item.qualityApproval}%
                        </span>
                      </div>
                      {item.incidents > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/40 px-1 py-0.2 rounded border border-rose-500/20">
                            {item.incidents}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">DH</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white leading-none truncate select-none">Danilo Henrique</p>
                <p className="text-[10px] text-slate-500 truncate mt-1">DaniloHenrique120@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold uppercase tracking-widest bg-slate-950/80 px-2 py-1.5 rounded border border-slate-850 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>FIRESTORE SYNC ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile search toggle */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)} 
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
          />
        )}

        {/* --- MAIN WORKSPACE AREA --- */}
        <main className="flex-1 overflow-y-auto bg-[#0c0f14] p-4 lg:p-6 flex flex-col">
          
          <AnimatePresence mode="wait">
            
            {/* ----------------- PRESENTATION SLIDE MODE ----------------- */}
            {isPresentationMode ? (
              <motion.div
                key="presentation-mode"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="flex-1 flex flex-col gap-6"
              >
                {/* Presentation Subheader status bar with integrated countdown standup timer */}
                <div className="bg-gradient-to-r from-amber-600/10 via-slate-900 to-emerald-950/10 border border-amber-600/20 rounded-xl px-5 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-amber-500 font-mono font-bold">Apresentação de Alta Performance</h4>
                      <p className="text-base font-display font-semibold text-gray-200">
                        {selectedMeeting ? selectedMeeting.weekName : 'Nova Reunião Semanal'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {/* Standup Countdown clock integrated into presentation bar */}
                    <div className="bg-slate-950/60 border border-[#232938] px-4 py-1.5 rounded-lg flex items-center gap-3 shadow-md">
                      <Clock3 className={`w-3.5 h-3.5 ${timerRunning ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold leading-none">Standup Timer</span>
                        <span className={`text-sm font-mono font-bold leading-none mt-1 ${timerSeconds < 60 ? 'text-rose-500 animate-pulse' : 'text-cyan-405'}`}>
                          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="bg-slate-800 hover:bg-slate-705 text-slate-350 p-1 rounded transition active:scale-95 cursor-pointer"
                          title={timerRunning ? 'Pausar' : 'Iniciar'}
                        >
                          {timerRunning ? <Pause className="w-3 h-3 text-amber-550" /> : <Play className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTimerSeconds(300); setTimerRunning(false); }}
                          className="bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-white px-1.5 py-1 rounded transition active:scale-95 cursor-pointer text-[9px] font-mono leading-none"
                          title="Reiniciar para 5 min"
                        >
                          REINICIAR
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">Condução:</span>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded text-sm font-semibold">
                        {leader || 'Não Identificado'}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-mono border border-gray-750">
                        {shift}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- NAVIGATION DECK FOR PRESENTATION SLIDES --- */}
                <div className="flex flex-col lg:flex-row bg-[#11141e] border border-[#232938] p-1.5 rounded-xl justify-between items-center gap-3">
                  
                  {/* Left: Previous / Next manual controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPresentationSlide(prev => (prev - 1 + 4) % 4)}
                      className="cursor-pointer bg-slate-900 border border-slate-850 hover:border-slate-700 p-2 rounded-lg text-slate-400 hover:text-white transition active:scale-95"
                      title="Slide Anterior"
                      type="button"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex bg-slate-950 px-3 py-1.5 border border-slate-850 rounded-lg text-[10px] font-mono font-bold text-slate-400">
                      SLIDE <span className="text-amber-500 px-1 font-extrabold">{presentationSlide + 1}</span> DE 4
                    </div>

                    <button
                      onClick={() => setPresentationSlide(prev => (prev + 1) % 4)}
                      className="cursor-pointer bg-slate-900 border border-slate-850 hover:border-slate-700 p-2 rounded-lg text-slate-400 hover:text-white transition active:scale-95"
                      title="Próximo Slide"
                      type="button"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center: Interactive Tabs for Presentation Slides */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1 overflow-x-auto max-w-full select-none">
                    <button
                      type="button"
                      onClick={() => setPresentationSlide(0)}
                      className={`py-1.5 px-3 rounded-lg font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                        presentationSlide === 0
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>1. Ata de Reunião</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPresentationSlide(1)}
                      className={`py-1.5 px-3 rounded-lg font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                        presentationSlide === 1
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>2. Industrial Analytics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPresentationSlide(2)}
                      className={`py-1.5 px-3 rounded-lg font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                        presentationSlide === 2
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>3. Quadro de Ações</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPresentationSlide(3)}
                      className={`py-1.5 px-3 rounded-lg font-display text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                        presentationSlide === 3
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>4. Impacto de Perdas (ROI)</span>
                    </button>
                  </div>

                  {/* Right: Autoplay carousel toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoPlaySlides(!autoPlaySlides)}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border transition-all ${
                        autoPlaySlides 
                          ? 'bg-emerald-950/50 text-emerald-450 border-emerald-500/25 shadow-md shadow-emerald-950/20' 
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-850'
                      }`}
                      title="Alternar rotação automática de slides de 10s para TVs industriais"
                    >
                      {autoPlaySlides ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="uppercase tracking-widest font-mono">CARROSSEL OPERACIONAL</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-slate-500" />
                          <span className="uppercase tracking-widest font-mono">ROTAÇÃO MANUAL</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* SLIDE GRID PRESENTATION ROUTER */}
                <div className="flex-1 flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    
                    {/* SLIDE 0: ATA DA REUNIÃO */}
                    {presentationSlide === 0 && (
                      <motion.div
                        key="slide-meeting"
                        initial={{ opacity: 0, scale: 0.995 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.995 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1"
                      >
                        {/* Left stats & details column */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                          
                          {/* ALINHAMENTOS COM O TIME */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg flex flex-col gap-5 justify-between flex-1 text-left">
                            <div>
                              <div className="flex items-center gap-2 mb-4 border-b border-[#1e2330] pb-2 text-left">
                                <Megaphone className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-display font-medium text-sm text-gray-300 uppercase tracking-wider">
                                  Alinhamentos com o Time
                                </h3>
                              </div>

                              <div className="p-4 bg-[#181d29] border border-cyan-500/10 rounded-lg text-sm text-gray-200 leading-relaxed min-h-[220px] whitespace-pre-line">
                                {teamAlignments ? teamAlignments : '📢 Nenhum recado ou alinhamento extraordinário programado.'}
                              </div>
                            </div>

                            <div className="mt-4 border-t border-[#1e2330] pt-3 text-[11px] text-slate-500 italic leading-relaxed text-left">
                              🗣️ Briefing operacional para garantir a padronização e a comunicação ágil de metas do turno.
                            </div>
                          </div>

                        </div>

                        {/* Right slides: safety / bottleneck / teams */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                          
                          {/* MOMENTO SEGURANÇA */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg text-left">
                            <div className="flex items-center gap-2 mb-3 border-b border-[#1e2330] pb-2">
                              <ShieldCheck className="w-5 h-5 text-emerald-400" />
                              <h3 className="font-display font-medium text-sm text-gray-300 uppercase tracking-wider">
                                Momento Segurança & Vitórias da Semana
                              </h3>
                            </div>
                            <div className="p-4 bg-[#181d29] border border-emerald-500/10 rounded-lg text-sm text-gray-205 leading-relaxed min-h-[90px] whitespace-pre-line">
                              {safetyAlert ? safetyAlert : '✅ Zero alertas de segurança ou ocorrências críticas relatadas.'}
                            </div>
                          </div>

                          {/* ARENA DE RESOLUÇÃO */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between text-left">
                            <div>
                              <div className="flex items-center gap-2 mb-4 border-b border-[#1e2330] pb-2">
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                                <h3 className="font-display font-medium text-sm text-gray-300 uppercase tracking-wider">
                                  Arena de Resolução
                                </h3>
                              </div>

                              <div className="bg-[#161a24] border border-[#252c3c] rounded-xl p-4.5 flex flex-col gap-2">
                                <span className="text-xs uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Descrição do Desvio / Oportunidade Catalogada:
                                </span>
                                <p className="text-gray-300 text-[13px] leading-relaxed whitespace-pre-line bg-[#11141b] border border-red-500/5 p-3 rounded-lg">
                                  {bottleneckProblem ? bottleneckProblem : 'Nenhum gargalo de relevância registrado nesta pauta.'}
                                </p>
                              </div>
                            </div>

                            {/* TEAM EVOLUTION */}
                            <div className="mt-6">
                              <div className="flex items-center gap-2 mb-3 border-b border-[#1e2330] pb-2">
                                <Users className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-display font-medium text-sm text-gray-300 uppercase tracking-wider">
                                  Reconhecimentos & Destaques dos Operadores
                                </h3>
                              </div>
                              {teamEvolution.length === 0 ? (
                                <div className="p-4 text-center bg-[#181d29] border border-gray-800 rounded-lg">
                                  <span className="text-xs text-gray-500">Nenhum feedback extraordinário ou destaque registrado para esta semana.</span>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto pr-1">
                                  {teamEvolution.map((item) => {
                                    const parsed = parseRecognition(item.update);
                                    return (
                                      <div 
                                        key={item.id} 
                                        className="bg-[#171b26] border border-[#232938] rounded-xl p-3.5 flex flex-col gap-2 shadow-sm text-left relative overflow-hidden"
                                      >
                                        <div className="flex justify-between items-center gap-2">
                                          <span className="font-display text-xs font-bold text-slate-100">{item.name}</span>
                                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${parsed.badge.bg} ${parsed.badge.text} ${parsed.badge.border} font-bold font-mono shrink-0`}>
                                            {parsed.badge.label}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-normal font-sans italic">
                                          "{parsed.cleanText}"
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SLIDE 1: INDUSTRIAL ANALYTICS */}
                    {presentationSlide === 1 && (() => {
                      const avgAdherence = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.oee, 0) / history.length * 10) / 10 : 0;
                      const avgQuality = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.qualityApproval, 0) / history.length * 10) / 10 : 0;
                      const grandTotalIncidents = history.reduce((sum, h) => sum + h.incidents, 0);
                      const totalMeetingsLogged = history.length;

                      // Safety and economic metrics
                      const safeWeeksCount = history.filter(h => h.incidents === 0).length;
                      const safetyComplianceRate = history.length > 0 ? Math.round((safeWeeksCount / history.length) * 100) : 100;
                      const safetyStopHours = grandTotalIncidents * 4;
                      const safetyFinancialLoss = safetyStopHours * machineHourCost + (grandTotalIncidents * 300);

                      // Plan and metrics consolidation
                      const shiftMetrics: Record<string, { oeeSum: number; qualitySum: number; count: number; incidents: number }> = {
                        '1º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 },
                        '2º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 },
                        '3º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 }
                      };
                      const leadersCount: Record<string, number> = {};
                      history.forEach(h => {
                        const sName = h.shift || '1º Turno';
                        if (shiftMetrics[sName]) {
                          shiftMetrics[sName].oeeSum += h.oee || 0;
                          shiftMetrics[sName].qualitySum += h.qualityApproval || 0;
                          shiftMetrics[sName].count += 1;
                          shiftMetrics[sName].incidents += h.incidents || 0;
                        }
                        if (h.leader) {
                          const lName = h.leader.trim();
                          leadersCount[lName] = (leadersCount[lName] || 0) + 1;
                        }
                      });

                      const topLeaders = Object.entries(leadersCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      let bestShift = '1º Turno';
                      let highestOee = 0;
                      Object.entries(shiftMetrics).forEach(([sName, m]) => {
                        const avgOee = m.count > 0 ? m.oeeSum / m.count : 0;
                        if (avgOee > highestOee) {
                          highestOee = avgOee;
                          bestShift = sName;
                        }
                      });

                      // Option 2: 5W2H Action tracker counts
                      let totalActions = 0;
                      let pendingActions = 0;
                      let inProgressActions = 0;
                      let completedActions = 0;
                      let overdueCount = 0;
                      const actionsByWho: Record<string, { total: number; completed: number; pending: number; inProgress: number }> = {};
                      const actionsList: Array<ActionItem5W2H & { weekName: string }> = [];
                      const todayStr = '2026-05-26'; // Benchmark today

                      history.forEach(h => {
                        (h.actions5w2h || []).forEach(a => {
                          totalActions++;
                          if (a.status === 'Concluído') completedActions++;
                          else if (a.status === 'Em Andamento') inProgressActions++;
                          else pendingActions++;

                          actionsList.push({ ...a, weekName: h.weekName });

                          if (a.status !== 'Concluído' && a.when && a.when < todayStr) {
                            overdueCount++;
                          }

                          if (a.who) {
                            const whoKey = a.who.trim();
                            if (!actionsByWho[whoKey]) {
                              actionsByWho[whoKey] = { total: 0, completed: 0, pending: 0, inProgress: 0 };
                            }
                            actionsByWho[whoKey].total++;
                            if (a.status === 'Concluído') actionsByWho[whoKey].completed++;
                            else if (a.status === 'Em Andamento') actionsByWho[whoKey].inProgress++;
                            else actionsByWho[whoKey].pending++;
                          }
                        });
                      });
                      const actionResolutionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
                      const topActionOwners = Object.entries(actionsByWho)
                        .sort((a, b) => b[1].total - a[1].total)
                        .slice(0, 5);

                      // Option 3: Gargalos & Ocorrências
                      const bottleneckCounts: Record<string, number> = {};
                      history.forEach(h => {
                        if (h.bottleneckProblem) {
                          const prob = h.bottleneckProblem.trim();
                          bottleneckCounts[prob] = (bottleneckCounts[prob] || 0) + 1;
                        }
                      });
                      const topBottlenecks = Object.entries(bottleneckCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      // Option 4: Team PDIs & Recognition
                      const tagCounts: Record<string, number> = {
                        'Destaque ⭐': 0,
                        'Feedback 👍': 0,
                        'Inovação 💡': 0,
                        'Desenvolvimento 🌱': 0,
                        'Segurança / Postura 🛡️': 0,
                        'Outros 🌟': 0
                      };
                      const memberRecognitionCounts: Record<string, number> = {};
                      const listAllRecognitions: Array<{ id: string; name: string; tag: string; text: string; weekName: string; badge: any }> = [];

                      history.forEach(h => {
                        (h.teamEvolution || []).forEach((t, idx) => {
                          const parsed = parseRecognition(t.update);
                          const tagLabel = parsed.badge.label;

                          if (tagLabel.includes('Destaque')) tagCounts['Destaque ⭐']++;
                          else if (tagLabel.includes('Feedback')) tagCounts['Feedback 👍']++;
                          else if (tagLabel.includes('Inovação')) tagCounts['Inovação 💡']++;
                          else if (tagLabel.includes('Desenvolvimento') || tagLabel.includes('Melhoria')) tagCounts['Desenvolvimento 🌱']++;
                          else if (tagLabel.includes('Segurança') || tagLabel.includes('Postura')) tagCounts['Segurança / Postura 🛡️']++;
                          else tagCounts['Outros 🌟']++;

                          if (t.name) {
                            const nameKey = t.name.trim();
                            memberRecognitionCounts[nameKey] = (memberRecognitionCounts[nameKey] || 0) + 1;
                          }

                          listAllRecognitions.push({
                            id: t.id || `${h.id}-${idx}`,
                            name: t.name,
                            tag: tagLabel,
                            text: parsed.cleanText,
                            weekName: h.weekName,
                            badge: parsed.badge
                          });
                        });
                      });

                      const topRecognizedMembers = Object.entries(memberRecognitionCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      let activeHighlightUser = 'Nenhum';
                      let maxHighlightCount = 0;
                      if (topRecognizedMembers.length > 0) {
                        activeHighlightUser = topRecognizedMembers[0][0];
                        maxHighlightCount = topRecognizedMembers[0][1];
                      }

                      return (
                        <motion.div
                          key="slide-analytics"
                          initial={{ opacity: 0, scale: 0.995 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.995 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 flex flex-col gap-6"
                        >
                          {/* Inner Sub-tab Navigation */}
                          <div className="flex border-b border-[#232938] gap-1 overflow-x-auto pb-px scrollbar-thin select-none">
                            <button
                              type="button"
                              onClick={() => setAnalyticsSubTab('shifts')}
                              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                                analyticsSubTab === 'shifts'
                                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                                  : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>1. Turnos & Ritmo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnalyticsSubTab('actions')}
                              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                                analyticsSubTab === 'actions'
                                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                                  : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
                              }`}
                            >
                              <ListTodo className="w-3.5 h-3.5" />
                              <span>2. Plano de Ações ({totalActions})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnalyticsSubTab('bottlenecks')}
                              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                                analyticsSubTab === 'bottlenecks'
                                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                                  : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>3. Desvios & Segurança</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnalyticsSubTab('team')}
                              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                                analyticsSubTab === 'team'
                                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                                  : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
                              }`}
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>4. Feedbacks & Clima</span>
                            </button>
                          </div>

                          {/* SUB-SECTION 1: TURNOS & RITMO */}
                          {analyticsSubTab === 'shifts' && (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-450 font-mono tracking-widest uppercase font-bold">Aderência Média</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={`text-3xl font-mono font-bold ${getAdherenceColor(avgAdherence).text}`}>{avgAdherence}%</span>
                                    <span className="text-xs text-slate-500">Global</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 font-bold">
                                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Meta técnica: ≥90%
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-450 font-mono tracking-widest uppercase font-bold">Qualidade Média</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={`text-3xl font-mono font-bold ${getQualColor(avgQuality).text}`}>{avgQuality}%</span>
                                    <span className="text-xs text-slate-505">Aprov.</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Award className="w-3.5 h-3.5 text-purple-400" /> Meta técnica: ≥98%
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-[#8e9bb4] font-mono tracking-widest uppercase font-bold">Turno Alta Perf.</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-2xl font-display font-black text-emerald-400 uppercase tracking-tight">{bestShift}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 font-bold">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Histórico consolidado
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-450 font-mono tracking-widest uppercase font-bold">Reuniões no Histórico</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-3xl font-mono font-bold text-slate-200">{totalMeetingsLogged}</span>
                                    <span className="text-xs text-slate-550">Sincro</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Registros ativos no Firestore
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                                <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-cyan-400" />
                                    <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Desempenho por Turno</h4>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {Object.entries(shiftMetrics).map(([sName, m]) => {
                                      const sAvgOee = m.count > 0 ? Math.round(m.oeeSum / m.count * 10) / 10 : 0;
                                      const sAvgQual = m.count > 0 ? Math.round(m.qualitySum / m.count * 10) / 10 : 0;
                                      
                                      return (
                                        <div key={sName} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg space-y-3">
                                          <div className="flex justify-between items-center">
                                            <div className="font-display font-bold text-white text-sm">{sName}</div>
                                            <div className="text-[10px] font-mono font-bold text-slate-550 uppercase">{m.count} reuniões</div>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-slate-900/40 border border-[#232938] p-2 rounded">
                                              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Aderência</div>
                                              <span className={`text-sm font-mono font-bold ${getAdherenceColor(sAvgOee).text}`}>{sAvgOee}%</span>
                                            </div>
                                            <div className="bg-slate-900/40 border border-[#232938] p-2 rounded">
                                              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Qualidade</div>
                                              <span className={`text-sm font-mono font-bold ${getQualColor(sAvgQual).text}`}>{sAvgQual}%</span>
                                            </div>
                                            <div className="bg-slate-900/40 border border-[#232938] p-2 rounded">
                                              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Acidentes</div>
                                              <span className={`text-sm font-mono font-bold ${m.incidents > 0 ? 'text-rose-400' : 'text-emerald-450'}`}>{m.incidents}</span>
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                              <span className="text-slate-500">Aderência vs Meta:</span>
                                              <span className="font-bold text-slate-400">{sAvgOee}% / 90%</span>
                                            </div>
                                            <div className="w-full bg-[#1e2535] h-1.5 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full rounded-full ${getAdherenceColor(sAvgOee).bg}`}
                                                style={{ width: `${Math.min(100, sAvgOee)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-cyan-400" />
                                      <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Facilitadores com Mais Engajamento</h4>
                                    </div>
                                    <span className="text-[10px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 px-2 py-0.5 rounded">Engajamento</span>
                                  </div>

                                  <div className="divide-y divide-[#232938] space-y-3.5 pr-1 max-h-[300px] overflow-y-auto">
                                    {topLeaders.length === 0 ? (
                                      <div className="p-4 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum facilitador cadastrado no histórico.
                                      </div>
                                    ) : (
                                      topLeaders.map(([lName, count], idx) => {
                                        const percent = totalMeetingsLogged > 0 ? Math.round((count / totalMeetingsLogged) * 100) : 0;
                                        return (
                                          <div key={lName} className={`${idx > 0 ? 'pt-3' : ''} flex items-center justify-between gap-4 text-xs`}>
                                            <div className="flex items-center gap-3">
                                              <div className="w-7 h-7 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs select-none">
                                                #{idx + 1}
                                              </div>
                                              <div>
                                                <span className="font-bold text-slate-205 block">{lName}</span>
                                                <span className="text-[10px] text-slate-500">Líder ativo no turno</span>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <span className="font-mono font-bold text-cyan-400 block">{count} Reuniões</span>
                                              <span className="text-[10px] text-slate-500 font-mono">{percent}% da rotina</span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Historical trend curve */}
                              <div className="bg-[#121620] border border-[#232938] rounded-xl p-6 shadow-xl space-y-4 text-left">
                                <div className="flex items-center justify-between border-b border-[#232938] pb-3 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    <div>
                                      <h3 className="font-display font-semibold text-white uppercase text-xs tracking-wider">Histórico de Performance & Evolução Semanal</h3>
                                      <p className="text-[10px] text-slate-500 mt-0.5">Visão analítica gerencial consolidada</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3 h-1 rounded-full bg-cyan-400"></span>
                                      <span>Aderência (%)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3 h-1 rounded-full bg-purple-500"></span>
                                      <span>Qualidade (%)</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800/80">
                                  {renderTrendsChart()}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SUB-SECTION 2: PLANO DE AÇÕES */}
                          {analyticsSubTab === 'actions' && (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Total de Ações</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                                    <span className="text-3xl font-bold text-slate-300">{totalActions}</span>
                                    <span className="text-xs text-slate-500">Criadas</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 font-bold">
                                    <ListTodo className="w-3.5 h-3.5 text-cyan-400" /> Contramedidas catalogadas
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Resolução Eficaz</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                                    <span className={`text-3xl font-bold ${actionResolutionRate >= 85 ? 'text-emerald-450' : 'text-cyan-400'}`}>{actionResolutionRate}%</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-450" /> Resolvidas: {completedActions}
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Em Progresso (WIP)</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                                    <span className="text-3xl font-bold text-amber-500">{inProgressActions}</span>
                                    <span className="text-xs text-slate-500">Pendentes: {pendingActions}</span>
                                  </div>
                                  <span className="text-[10px] text-[#93a2bc] mt-2 flex items-center gap-1.5 font-bold">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Ações sob monitoramento
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Ações Atrasadas</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                                    <span className={`text-3xl font-bold ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-450'}`}>{overdueCount}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <AlertCircle className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} /> Ultrapassaram prazo
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                                <div className="lg:col-span-1 bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-cyan-400" />
                                    <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Ações por Responsável</h4>
                                  </div>

                                  <div className="space-y-4 max-h-[360px] overflow-y-auto">
                                    {topActionOwners.length === 0 ? (
                                      <div className="p-4 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum responsável com ações pendentes.
                                      </div>
                                    ) : (
                                      topActionOwners.map(([oName, metrics]) => {
                                        const percent = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
                                        return (
                                          <div key={oName} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg space-y-2">
                                            <div className="flex justify-between items-baseline text-xs">
                                              <span className="font-bold text-slate-200">{oName}</span>
                                              <span className="font-mono text-slate-400 text-[10px] font-bold">
                                                {metrics.completed}/{metrics.total} ({percent}%)
                                              </span>
                                            </div>

                                            <div className="w-full bg-[#1e2535] h-1.5 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-cyan-500 rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>

                                <div className="lg:col-span-2 bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <ListTodo className="w-4 h-4 text-cyan-400" />
                                      <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Contramedidas Mapeadas</h4>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">Transparência 5W2H</span>
                                  </div>

                                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                                    {actionsList.length === 0 ? (
                                      <div className="p-6 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhuma contramedida de plano de ação catalogada.
                                      </div>
                                    ) : (
                                      actionsList.map((act, index) => {
                                        const isOverdue = act.status !== 'Concluído' && act.when && act.when < todayStr;
                                        return (
                                          <div key={act.id || index} className="p-3 bg-slate-950/45 border border-[#232938] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1.5">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-mono font-bold bg-[#1e2535] border border-[#232938] px-1.5 py-0.2 rounded text-slate-400">
                                                  {act.weekName}
                                                </span>
                                                <span className="font-bold text-slate-205 text-xs">O quê: {act.what}</span>
                                              </div>
                                              <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
                                                <span className="flex items-center gap-1">
                                                  <User className="w-3 h-3 text-cyan-450" /> <span className="text-slate-200">{act.who}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3 text-cyan-455" /> <span className={`${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-350'}`}>{act.when.split('-').reverse().join('/')}</span>
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 font-mono">
                                              <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                                                act.status === 'Concluído'
                                                  ? 'bg-emerald-950/40 text-emerald-450 border-emerald-500/20'
                                                  : act.status === 'Em Andamento'
                                                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                                                  : 'bg-slate-950 text-slate-400 border-[#232938]'
                                              }`}>
                                                {act.status}
                                              </span>
                                              {isOverdue && (
                                                <span className="text-[8px] uppercase font-black text-rose-400 tracking-wider flex items-center gap-1 bg-rose-950/20 px-1 py-0.2 rounded border border-rose-500/20">
                                                  <AlertCircle className="w-2.5 h-2.5 animate-pulse" /> Em Atraso
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SUB-SECTION 3: DESVIOS & SEGURANÇA */}
                          {analyticsSubTab === 'bottlenecks' && (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left font-mono">
                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Sem Acidentes</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={`text-3xl font-bold ${safetyComplianceRate === 100 ? 'text-emerald-450' : 'text-amber-450'}`}>{safetyComplianceRate}%</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Planta Segura
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Ocorrências</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={`text-3xl font-mono font-bold ${grandTotalIncidents > 0 ? 'text-rose-450 animate-pulse' : 'text-emerald-450'}`}>{grandTotalIncidents}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Acidentes catalogados
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Horas Parada Estimadas</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-3xl font-bold text-amber-500">{safetyStopHours}</span>
                                    <span className="text-xs text-slate-500">Horas</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Clock className="w-3.5 h-3.5 text-amber-505" /> Impacto de MTTR/MTBF
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Impacto Financeiro</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className={`text-md font-bold ${safetyFinancialLoss > 0 ? 'text-rose-400' : 'text-slate-350'}`}>
                                      R$ {safetyFinancialLoss.toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <DollarSign className="w-3.5 h-3.5 text-rose-500" /> Desperdício por inatividade
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                                <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Desvios Críticos & Gargalos</h4>
                                  </div>

                                  <div className="space-y-3 px-1 max-h-[340px] overflow-y-auto">
                                    {topBottlenecks.length === 0 ? (
                                      <div className="p-4 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum gargalo de processo registrado.
                                      </div>
                                    ) : (
                                      topBottlenecks.map(([bProb, count], idx) => (
                                        <div key={bProb} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg flex items-center justify-between gap-4">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs bg-slate-900 border border-[#232938] w-5 h-5 flex items-center justify-center rounded font-mono font-bold text-slate-400">
                                                #{idx + 1}
                                              </span>
                                              <span className="text-xs font-bold text-slate-200">{bProb}</span>
                                            </div>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className="text-xs font-mono font-bold text-amber-400 block">{count} ocorrência{count > 1 ? 's' : ''}</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                      <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Mural de Alertas de Segurança</h4>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">{history.length} Reuniões</span>
                                  </div>

                                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                                    {history.filter(h => h.safetyAlert || h.incidents > 0).length === 0 ? (
                                      <div className="p-6 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum desvio detectado. Fábrica operando com segurança total.
                                      </div>
                                    ) : (
                                      history.filter(h => h.safetyAlert || h.incidents > 0).map((h, i) => (
                                        <div key={h.id || i} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg flex gap-3 text-xs justify-between items-start">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-900 border border-[#232938] px-1.5 py-0.2 rounded">
                                                {h.weekName}
                                              </span>
                                              {h.incidents > 0 && (
                                                <span className="text-[8px] bg-rose-950/50 text-rose-450 border border-rose-500/20 px-1 py-0.2 rounded font-mono font-bold">
                                                  {h.incidents} Acidente{h.incidents > 1 ? 's' : ''}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-slate-350 block leading-relaxed text-[11px] italic">
                                              "{h.safetyAlert || 'Segurança Semanal Confirmada ✅'}"
                                            </span>
                                          </div>
                                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${h.incidents > 0 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SUB-SECTION 4: FEEDBACKS & CLIMA */}
                          {analyticsSubTab === 'team' && (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left font-mono">
                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Feedback Registrados</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-3xl font-bold text-slate-300">{listAllRecognitions.length}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Histórico coletivo
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Destaques ⭐ Emitidos</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                                    <span className="text-3xl font-bold text-amber-400">{tagCounts['Destaque ⭐']}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-450" /> Atribuição de excelência
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Inovações Mapeadas</span>
                                  <div className="flex items-baseline gap-1.5 mt-1 font-mono font-bold text-purple-400">
                                    <span className="text-3xl">{tagCounts['Inovação 💡']}</span>
                                    <span className="text-xs text-slate-500">Ideias</span>
                                  </div>
                                  <span className="text-[10px] text-slate-505 mt-2 flex items-center gap-1.5 font-bold">
                                    <Award className="w-3.5 h-3.5 text-purple-405" /> Sugestões implantadas
                                  </span>
                                </div>

                                <div className="bg-[#121620] border border-[#232938] p-5 rounded-xl shadow-lg flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Fera do Histórico</span>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-lg font-display font-black text-emerald-400 uppercase tracking-tight truncate max-w-[150px]" title={activeHighlightUser}>
                                      {activeHighlightUser}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-550 mt-2 flex items-center gap-1.5 font-bold">
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> {maxHighlightCount} menções registradas
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                                <div className="lg:col-span-1 bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-[#232938] pb-2.5 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-cyan-400" />
                                    <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Líderes de Reconhecimento</h4>
                                  </div>

                                  <div className="space-y-4">
                                    {topRecognizedMembers.length === 0 ? (
                                      <div className="p-4 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum feedback catalogado.
                                      </div>
                                    ) : (
                                      topRecognizedMembers.map(([mName, count], idx) => (
                                        <div key={mName} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded bg-[#1e2535] border border-[#232938] text-cyan-400 flex items-center justify-center font-bold text-xs select-none">
                                              #{idx + 1}
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-200 block">{mName}</span>
                                              <span className="text-[10px] text-slate-500">Colaborador em evolução</span>
                                            </div>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className="text-xs font-mono font-bold text-cyan-400 block">{count} menç{count > 1 ? 'ões' : 'ão'}</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                <div className="lg:col-span-2 bg-[#121620] border border-[#232938] rounded-xl p-5 shadow-lg space-y-4">
                                  <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-cyan-400" />
                                      <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Feed unificado de Clima e Desenvolvimento</h4>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">Mensagens Mapeadas</span>
                                  </div>

                                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                                    {listAllRecognitions.length === 0 ? (
                                      <div className="p-6 border border-dashed border-[#232938] text-center text-xs text-slate-500 rounded-xl">
                                        Nenhum clima ou elogio registrado.
                                      </div>
                                    ) : (
                                      listAllRecognitions.map((item) => (
                                        <div key={item.id} className="p-3 bg-slate-950/40 border border-[#232938] rounded-lg flex justify-between gap-4 items-start">
                                          <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                                              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${item.badge.bg} ${item.badge.text} ${item.badge.border} font-bold font-mono`}>
                                                {item.badge.label}
                                              </span>
                                            </div>
                                            <span className="text-slate-400 block text-[11px] leading-relaxed italic">
                                              "{item.text}"
                                            </span>
                                          </div>
                                          <span className="text-[9px] bg-slate-900 border border-[#232938] px-2.5 py-0.5 rounded font-mono shrink-0 select-none text-slate-400">
                                            {item.weekName}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}

                    {/* SLIDE 2: QUADRO DE AÇÕES 5W2H */}
                    {presentationSlide === 2 && (
                      <motion.div
                        key="slide-actions"
                        initial={{ opacity: 0, scale: 0.995 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.995 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col gap-6"
                      >
                        <div className="flex justify-between items-center text-left">
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-amber-500 font-mono font-bold leading-none">Acompanhamento e Rastreabilidade</h4>
                            <h2 className="text-lg font-display font-bold text-white mt-1">Plano de Contramedidas Industriais (Método 5W2H)</h2>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                            Foco em Ações Corretivas Rápidas
                          </span>
                        </div>

                        {/* Full Size Presentation Kanban Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[480px]">
                          
                          {/* PENDENTE COLUMN */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 flex flex-col gap-5">
                            <div className="flex justify-between items-center bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <h4 className="font-display font-extrabold text-xs text-amber-500 uppercase tracking-widest">A Fazer / Pendente</h4>
                              </div>
                              <span className="bg-amber-950/40 text-amber-500 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-lg font-mono font-black">
                                {actions5w2h.filter(a => a.status === 'Pendente').length}
                              </span>
                            </div>

                            <div className="space-y-4 max-h-[425px] overflow-y-auto pr-1">
                              {actions5w2h.filter(a => a.status === 'Pendente').length === 0 ? (
                                <div className="py-24 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-semibold">
                                  Sem pendências mapeadas.
                                </div>
                              ) : (
                                actions5w2h.filter(a => a.status === 'Pendente').map(a => renderKanbanCard(a))
                              )}
                            </div>
                          </div>

                          {/* EM ANDAMENTO COLUMN */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 flex flex-col gap-5">
                            <div className="flex justify-between items-center bg-cyan-500/10 px-4 py-3 rounded-xl border border-cyan-500/20">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                <h4 className="font-display font-extrabold text-xs text-cyan-400 uppercase tracking-widest">Em Execução</h4>
                              </div>
                              <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-xs px-2.5 py-0.5 rounded-lg font-mono font-black">
                                {actions5w2h.filter(a => a.status === 'Em Andamento').length}
                              </span>
                            </div>

                            <div className="space-y-4 max-h-[425px] overflow-y-auto pr-1">
                              {actions5w2h.filter(a => a.status === 'Em Andamento').length === 0 ? (
                                <div className="py-24 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-semibold">
                                  Nenhuma atividade em andamento.
                                </div>
                              ) : (
                                actions5w2h.filter(a => a.status === 'Em Andamento').map(a => renderKanbanCard(a))
                              )}
                            </div>
                          </div>

                          {/* CONCLUÍDO COLUMN */}
                          <div className="bg-[#121620] border border-[#232938] rounded-xl p-5 flex flex-col gap-5">
                            <div className="flex justify-between items-center bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                <h4 className="font-display font-extrabold text-xs text-emerald-400 uppercase tracking-widest">Concluído</h4>
                              </div>
                              <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-lg font-mono font-black">
                                {actions5w2h.filter(a => a.status === 'Concluído').length}
                              </span>
                            </div>

                            <div className="space-y-4 max-h-[425px] overflow-y-auto pr-1">
                              {actions5w2h.filter(a => a.status === 'Concluído').length === 0 ? (
                                <div className="py-24 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-semibold">
                                  Nenhuma ação concluída para apresentar.
                                </div>
                              ) : (
                                actions5w2h.filter(a => a.status === 'Concluído').map(a => renderKanbanCard(a))
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* SLIDE 3: IMPACTO DE PERDAS (ROI) */}
                    {presentationSlide === 3 && (() => {
                      const totalPlannedVol = productionPlans.reduce((sum, p) => sum + (Number(p.planned) || 0), 0);
                      const totalRealVol = productionPlans.reduce((sum, p) => sum + (Number(p.realized) || 0), 0);
                      const unitDeficit = Math.max(0, totalPlannedVol - totalRealVol);
                      const volumeLossCost = unitDeficit * costPerUnit;

                      const qualityGap = Math.max(0, 100 - qualityApproval);
                      const qualityLossCost = qualityGap * scrapCostPercentage;

                      const safetyStopHours = incidents * 4;
                      const safetyLostCost = safetyStopHours * machineHourCost + (incidents * 300);

                      const grandTotalIndustrialLoss = volumeLossCost + qualityLossCost + safetyLostCost;
                      const estimatedRecoupedValue = Math.round(grandTotalIndustrialLoss * 0.85);

                      return (
                        <motion.div
                          key="slide-roi"
                          initial={{ opacity: 0, scale: 0.995 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.995 }}
                          className="flex-1 flex flex-col gap-6 text-left"
                        >
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-rose-500 font-mono font-bold leading-none">Impacto Financeiro e Oportunidades</h4>
                              <h2 className="text-lg font-display font-bold text-white mt-1 font-semibold">ROI sobre Contenção de Desperdícios Crônicos</h2>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-450 px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase tracking-wider">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Vazamento Financeiro de Linha
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Detailed operations cost cards */}
                            <div className="lg:col-span-2 bg-[#121620] border border-[#232938] rounded-xl p-6 shadow-xl space-y-6">
                              <span className="text-xs font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest border-b border-slate-800 pb-3 font-display">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                Diagnóstico Monetário de Perda Industrial Semanal
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Volume Pendente</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-300 mt-1">{unitDeficit} unidades calculadas</span>
                                  <span className="text-2xl font-mono font-black text-rose-400 mt-1.5">R$ {volumeLossCost.toLocaleString('pt-BR')}</span>
                                  <span className="text-[9px] text-slate-500 mt-1 block">Oportunidade perdida de faturamento</span>
                                </div>

                                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Descarte de Qualidade</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-300 mt-1">{-qualityGap.toFixed(1)}% Desvio Qualidade</span>
                                  <span className="text-2xl font-mono font-black text-rose-400 mt-1.5">R$ {qualityLossCost.toLocaleString('pt-BR')}</span>
                                  <span className="text-[9px] text-slate-505 mt-1 block">Peças rejeitadas em auditoria</span>
                                </div>

                                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Downtime / Setup Prolongado</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-300 mt-1">{safetyStopHours} horas estimadas</span>
                                  <span className="text-2xl font-mono font-black text-rose-400 mt-1.5">R$ {safetyLostCost.toLocaleString('pt-BR')}</span>
                                  <span className="text-[9px] text-slate-505 mt-1 block">Ociosidade operacional das linhas</span>
                                </div>
                              </div>

                              <div className="p-5 bg-rose-950/15 border border-rose-500/20 rounded-xl flex justify-between items-center flex-wrap gap-4">
                                <div>
                                  <span className="text-xs uppercase text-slate-400 block font-bold tracking-widest font-display">Capital em Risco Mensal Projetado:</span>
                                  <span className="text-[10px] text-slate-500 block leading-normal mt-1">Estimativa de custos industriais extras se os desvios mantiverem-se constantes</span>
                                </div>
                                <span className="text-3xl font-mono font-black text-rose-500">R$ {grandTotalIndustrialLoss.toLocaleString('pt-BR')}</span>
                              </div>
                            </div>

                            {/* Return on Investment block */}
                            <div className="lg:col-span-1 bg-[#0b1c24] border border-cyan-500/20 rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6">
                              <div className="space-y-4">
                                <span className="text-xs font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest font-display">
                                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                                  Plano de Retorno (Prevenção ROI)
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                  Ao implantar contramedidas e erradicar perdas crônicas em média de <strong className="text-cyan-400 font-bold">85%</strong> através da nossa gestão semanal, a fábrica blindará de capital operacional:
                                </p>

                                <div className="p-5 bg-slate-950/45 border border-cyan-500/15 rounded-xl">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">Capital Líquido Preservado:</span>
                                  <span className="text-3xl font-mono font-black text-cyan-405 block mt-1">R$ {estimatedRecoupedValue.toLocaleString('pt-BR')}</span>
                                  <span className="text-[9px] text-slate-500 block mt-1.5">Preservado diretamente no fluxo de caixa</span>
                                </div>

                                <div className="flex gap-4 text-xs font-sans text-slate-405 pt-1 justify-between flex-wrap">
                                  <div className="space-y-1">
                                    <span className="block text-[10px] text-slate-500 uppercase font-black">Invest. Estimado</span>
                                    <span className="block font-bold text-white font-mono text-sm">R$ 2.500</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="block text-[10px] text-slate-500 uppercase font-black">Payback Médio</span>
                                    <span className="block font-bold text-emerald-450 font-mono text-sm">Sub 14 Dias!</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleCopyFormattedReport}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3.5 px-4 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2 w-full"
                              >
                                <Copy className="w-4 h-4" />
                                COPIAR SUMÁRIO EXECUTIVO
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })()}

                  </AnimatePresence>
                </div>

                {/* Back to edit floating bubble or bar */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => setIsPresentationMode(false)}
                    className="cursor-pointer bg-[#181d29] hover:bg-gray-800 border border-gray-700 hover:border-amber-500/40 text-xs text-gray-400 hover:text-amber-400 px-6 py-2.5 rounded-full inline-flex items-center gap-2 transition"
                  >
                    <Shrink className="w-4 h-4" />
                    Sair da Tela Cheia de Apresentação
                  </button>
                </div>
              </motion.div>
            ) : (
              
              // ----------------- STANDARD INTERACTIVE FORM MODE -----------------
              <motion.div
                key="form-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col gap-6"
              >
                {/* Form header and active meeting marker */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 text-cyan-400 border border-slate-800 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Pauta Semanal sob Edição</span>
                      <h2 className="text-base font-display font-bold text-white">
                        {selectedMeeting 
                          ? `Visualizando: ${selectedMeeting.weekName}` 
                          : 'Criação de Novo Registro Industrial'}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedMeeting ? (
                      <span className="text-xs bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded font-mono font-semibold">
                        ID: {selectedMeeting.id} (Registrado)
                      </span>
                    ) : (
                      <span className="text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded font-mono font-semibold">
                        Novo Documento
                      </span>
                    )}

                    {selectedMeeting && (
                      <button
                        type="button"
                        onClick={handleNewMeeting}
                        className="cursor-pointer text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition"
                      >
                        Limpar / Novo
                      </button>
                    )}
                  </div>
                </div>

                {/* --- PREMIUM WORKSPACE TABS SWITCHER --- */}
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 overflow-x-auto select-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('meeting')}
                    className={`flex-1 py-3 px-4 rounded-lg font-display text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-155 shrink-0 ${
                      activeTab === 'meeting'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ata da Reunião</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 py-3 px-4 rounded-lg font-display text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-155 shrink-0 ${
                      activeTab === 'analytics'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Industrial Analytics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('actions')}
                    className={`flex-1 py-3 px-4 rounded-lg font-display text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-155 shrink-0 ${
                      activeTab === 'actions'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    <span>Quadro de Ações 5W2H</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('roi')}
                    className={`flex-1 py-3 px-4 rounded-lg font-display text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-155 shrink-0 ${
                      activeTab === 'roi'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Impacto de Perdas (ROI)</span>
                  </button>
                </div>

                {/* --- WORKSPACE TABS ROUTER RENDERING --- */}
                {activeTab === 'meeting' && (
                  /* FORM GRID */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* METADATA AND KPIs COLUMN (Left Column) */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* CABEÇALHO DA REUNIÃO */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                      <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                        <div className="w-1 px-1 bg-cyan-500 rounded h-4"></div>
                        <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          Identificação & Turno
                        </h3>
                      </div>

                      {/* DATA DA APAUTA */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Data da Reunião
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-md border border-slate-800 focus:border-cyan-500/50 focus:outline-none transition text-sm"
                        />
                      </div>

                      {/* TURNO DE PRODUÇÃO (SELECT) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Turno de Produção
                        </label>
                        <select
                          value={shift}
                          onChange={(e) => setShift(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-md border border-slate-800 focus:border-cyan-500/50 focus:outline-none cursor-pointer transition text-sm"
                        >
                          <option value="1º Turno">1º Turno</option>
                          <option value="2º Turno">2º Turno</option>
                          <option value="3º Turno">3º Turno</option>
                        </select>
                      </div>

                      {/* LÍDER DA REUNIÃO */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          Líder da Reunião (Facilitador)
                        </label>
                        <input
                          type="text"
                          value={leader}
                          onChange={(e) => setLeader(e.target.value)}
                          placeholder="Ex: Carlos Silva (Superv.)"
                          className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-md border border-slate-800 focus:border-cyan-500/50 focus:outline-none transition text-sm"
                        />
                      </div>
                    </div>

                    {/* ALINHAMENTOS COM O TIME */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                      
                      <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1 px-1 bg-cyan-500 rounded h-4"></div>
                          <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                            Alinhamentos com o Time
                          </h3>
                        </div>
                        <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded uppercase font-mono font-bold">
                          Briefing de Equipe
                        </span>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Adicione instruções operacionais, avisos importantes, lembretes de compliance, ou pontos cruciais que devem ser repassados e discutidos durante reuniões rápidas com toda a equipe do turno.
                        </p>

                        <div className="space-y-1.5">
                          <textarea
                            value={teamAlignments}
                            onChange={(e) => setTeamAlignments(e.target.value)}
                            placeholder="Escreva os alinhamentos ou avisos importantes aqui (recomenda-se usar marcadores, ex:&#10;• Ponto de atenção 1...&#10;• Ponto de atenção 2...)"
                            rows={10}
                            className="w-full bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 focus:border-cyan-500/50 focus:outline-none transition text-sm font-sans placeholder-slate-600 leading-relaxed resize-none"
                          />
                        </div>
                      </div>

                    </div>

                    {/* CONTROLE DE ACIDENTES (SEGURANÇA DO TRABALHO) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                      
                      <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 px-1 rounded h-4 ${incidents === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                            Segurança do Trabalho
                          </h3>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-mono font-bold border ${
                          incidents === 0 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-950/40 text-rose-400 border-rose-500/20'
                        }`}>
                          {incidents === 0 ? 'Planta Segura' : 'Alerta Sinaleira'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-400 leading-normal">
                          Houve registro de acidente de trabalho na semana de turno?
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIncidents(0)}
                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              incidents === 0
                                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-inner'
                                : 'bg-slate-950/50 text-slate-400 border-slate-805 hover:text-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Não (Zero Acidentes)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (incidents === 0) setIncidents(1);
                            }}
                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              incidents > 0
                                ? 'bg-rose-600/20 text-rose-400 border-rose-500/40 shadow-inner'
                                : 'bg-slate-950/50 text-slate-400 border-slate-805 hover:text-slate-200'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Sim (Houve Ocorrência)</span>
                          </button>
                        </div>

                        {incidents > 0 && (
                          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3 animate-fadeIn">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-rose-400 block">Quantidade de Ocorrências:</span>
                              <span className="text-xs text-slate-400 block leading-tight">Quantos acidentes registrados?</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
                              <button
                                type="button"
                                onClick={() => setIncidents(Math.max(1, incidents - 1))}
                                className="w-5 h-5 flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-slate-300 rounded text-xs font-bold transition cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono text-xs font-bold text-white">
                                {incidents}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIncidents(incidents + 1)}
                                className="w-5 h-5 flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-slate-300 rounded text-xs font-bold transition cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* OPERATIONAL BLOCKS (Right Columns - takes 2/3 of grid space) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* MOMENTO SEGURANÇA / QUALIDADE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                      <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1 px-1 bg-emerald-500 rounded h-4"></div>
                          <h3 className="font-display text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            Momento Segurança ou Vitória da Semana
                          </h3>
                        </div>
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase font-mono font-bold">
                          Comitê Ativo DSS
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-400 leading-normal mb-1">
                          Registre aqui os principais alertas preventivos de SMS (Segurança, Meio Ambiente e Saúde) ou vitórias/metas operacionais de qualidade batidas pelo time na semana.
                        </p>
                        <textarea
                          rows={3}
                          value={safetyAlert}
                          onChange={(e) => setSafetyAlert(e.target.value)}
                          placeholder="Ex: Verificado desgaste na fiação elétrica do painel pneumático. Manutenção realizou substituição mecânica de suporte evitado sinistro..."
                          className="w-full bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 focus:border-cyan-500/50 focus:outline-none placeholder-slate-600 text-sm font-sans resize-y"
                        />
                      </div>
                    </div>

                    {/* ARENA DE RESOLUÇÃO (GARGALO DA SEMANA) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                      
                      <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1 px-1 bg-rose-500 rounded h-4"></div>
                          <h3 className="font-display text-sm font-semibold text-rose-450 uppercase tracking-wide flex items-center gap-2">
                            Arena de Resolução
                          </h3>
                        </div>
                        <span className="text-[10px] bg-rose-950/40 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded uppercase font-mono font-bold">
                          Método 5 Porquês
                        </span>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Mapeie o principal desvio, quebra mecânica ou limitação operacional que impediu a máxima performance nesta semana.
                        </p>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-widest text-[#f87171] font-bold">
                            Descrição do Gargalo ou Impedimento Técnico:
                          </label>
                          <textarea
                            rows={5}
                            value={bottleneckProblem}
                            onChange={(e) => setBottleneckProblem(e.target.value)}
                            placeholder="Descreva detalhadamente o principal desvio técnico, quebra de máquina ou limitação de capacidade que impediu o progresso..."
                            className="w-full bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 focus:border-cyan-500/50 focus:outline-none placeholder-slate-600 text-sm leading-relaxed resize-none"
                          />
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-lg flex items-start gap-3.5 text-xs text-slate-300 leading-relaxed">
                          <span className="shrink-0 bg-rose-950/40 text-[#ef4444] border border-[#991b1b]/30 text-[9px] uppercase font-mono font-black px-2 py-0.5 rounded mt-0.5">Fluxo Ágil</span>
                          <span>Com o objetivo de manter a rastreabilidade unificada, registre as contra-ações desse gargalo na aba <strong>"Plano de Ação (5W2H)"</strong> abaixo.</span>
                        </div>
                      </div>

                    </div>

                    {/* RECONHECIMENTO & FEEDBACK DO TIME (OPERADORES DESTAQUE) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                      
                      <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1 px-1 bg-amber-500 rounded h-4"></div>
                          <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                            Mural de Reconhecimento & Feedback
                          </h3>
                        </div>
                        <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded uppercase font-mono font-bold">
                          Destaques e Reconhecimento
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-normal mb-1">
                        Use este espaço para registrar atitudes excepcionais dos operadores, setups ágeis, feedbacks positivos ou construtivos e ideias de melhorias trazidas pelo time na semana de turno.
                      </p>

                      {/* ADD COLLABORATOR ATRIBUTTION BAR */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Tipo / Categoria:</label>
                          <select
                            value={newMemberCategory}
                            onChange={(e) => setNewMemberCategory(e.target.value)}
                            className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          >
                            <option value="[Destaque ⭐]">⭐ Destaque Operacional</option>
                            <option value="[Feedback 👍]">👍 Feedback Positivo</option>
                            <option value="[Ideia 💡]">💡 Inovação e Ideias</option>
                            <option value="[Melhoria 🌱]">🌱 Desenvolvimento / PDI</option>
                            <option value="[Postura 🛡️]">🛡️ Segurança / Postura</option>
                          </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Colaborador / Operador:</label>
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Ex: João Santos"
                            className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Motivo / Descrição do Destaque:</label>
                          <input
                            type="text"
                            value={newMemberUpdate}
                            onChange={(e) => setNewMemberUpdate(e.target.value)}
                            placeholder="Ex: Auxiliou brilhantemente no setup ágil de linha"
                            className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3 rounded text-xs transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Registrar
                          </button>
                        </div>
                      </div>

                      {/* TEAM MEMBER STATUS LIST */}
                      <div className="space-y-2 mt-2">
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider font-bold">Membros Reconhecidos na Semana:</span>
                        
                        {teamEvolution.length === 0 ? (
                          <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center bg-slate-950/20 text-xs text-slate-500 font-sans">
                            Nenhum destaque ou reconhecimento fixado nesta semana ainda. Faça o preenchimento acima.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {teamEvolution.map((item) => {
                              const parsed = parseRecognition(item.update);
                              return (
                                <div 
                                  key={item.id}
                                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 flex items-center justify-between transition gap-4"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-display text-xs font-semibold text-amber-300 block">
                                        {item.name}
                                      </span>
                                      <span className={`text-[9px] px-2 py-0.2 rounded border ${parsed.badge.bg} ${parsed.badge.text} ${parsed.badge.border} font-bold font-mono`}>
                                        {parsed.badge.label}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block leading-relaxed italic mt-0.5">
                                      "{parsed.cleanText}"
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTeamMember(item.id)}
                                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1 shrink-0"
                                    title="Remover Registro"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
                )}

                {/* --- CHRONO / ANALYTICS WORKSPACE TAB --- */}
                {activeTab === 'analytics' && (() => {
                  const avgAdherence = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.oee, 0) / history.length * 10) / 10 : 0;
                  const avgQuality = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.qualityApproval, 0) / history.length * 10) / 10 : 0;
                  const grandTotalIncidents = history.reduce((sum, h) => sum + h.incidents, 0);
                  const totalMeetingsLogged = history.length;

                  // Safety and economic metrics
                  const safeWeeksCount = history.filter(h => h.incidents === 0).length;
                  const safetyComplianceRate = history.length > 0 ? Math.round((safeWeeksCount / history.length) * 100) : 100;
                  const safetyStopHours = grandTotalIncidents * 4;
                  const safetyFinancialLoss = safetyStopHours * machineHourCost + (grandTotalIncidents * 300);

                  // Production volumes
                  const totalPlannedVolume = history.reduce((sum, h) => {
                    const plans = h.productionPlans || [];
                    return sum + plans.reduce((s, p) => s + (Number(p.planned) || 0), 0);
                  }, 0);
                  const totalRealizedVolume = history.reduce((sum, h) => {
                    const plans = h.productionPlans || [];
                    return sum + plans.reduce((s, p) => s + (Number(p.realized) || 0), 0);
                  }, 0);
                  const volumetricAdherence = totalPlannedVolume > 0 ? Math.round((totalRealizedVolume / totalPlannedVolume) * 100) : 0;

                  // Product aggregation
                  const productAggregates: Record<string, { planned: number; realized: number }> = {};
                  history.forEach(h => {
                    (h.productionPlans || []).forEach(p => {
                      if (!p.name) return;
                      const nameKey = p.name.trim();
                      if (!productAggregates[nameKey]) {
                        productAggregates[nameKey] = { planned: 0, realized: 0 };
                      }
                      productAggregates[nameKey].planned += Number(p.planned) || 0;
                      productAggregates[nameKey].realized += Number(p.realized) || 0;
                    });
                  });

                  // Option 1: Turnos & Ritmo Calculations
                  const shiftMetrics: Record<string, { oeeSum: number; qualitySum: number; count: number; incidents: number }> = {
                    '1º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 },
                    '2º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 },
                    '3º Turno': { oeeSum: 0, qualitySum: 0, count: 0, incidents: 0 }
                  };
                  const leadersCount: Record<string, number> = {};
                  history.forEach(h => {
                    const sName = h.shift || '1º Turno';
                    if (shiftMetrics[sName]) {
                      shiftMetrics[sName].oeeSum += h.oee || 0;
                      shiftMetrics[sName].qualitySum += h.qualityApproval || 0;
                      shiftMetrics[sName].count += 1;
                      shiftMetrics[sName].incidents += h.incidents || 0;
                    }
                    if (h.leader) {
                      const lName = h.leader.trim();
                      leadersCount[lName] = (leadersCount[lName] || 0) + 1;
                    }
                  });

                  const topLeaders = Object.entries(leadersCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                  let bestShift = '1º Turno';
                  let highestOee = 0;
                  Object.entries(shiftMetrics).forEach(([sName, m]) => {
                    const avgOee = m.count > 0 ? m.oeeSum / m.count : 0;
                    if (avgOee > highestOee) {
                      highestOee = avgOee;
                      bestShift = sName;
                    }
                  });

                  // Option 2: 5W2H Action tracker counts
                  let totalActions = 0;
                  let pendingActions = 0;
                  let inProgressActions = 0;
                  let completedActions = 0;
                  let overdueCount = 0;
                  const actionsByWho: Record<string, { total: number; completed: number; pending: number; inProgress: number }> = {};
                  const actionsList: Array<ActionItem5W2H & { weekName: string }> = [];
                  const todayStr = '2026-05-26'; // Benchmark today

                  history.forEach(h => {
                    (h.actions5w2h || []).forEach(a => {
                      totalActions++;
                      if (a.status === 'Concluído') completedActions++;
                      else if (a.status === 'Em Andamento') inProgressActions++;
                      else pendingActions++;

                      actionsList.push({ ...a, weekName: h.weekName });

                      if (a.status !== 'Concluído' && a.when && a.when < todayStr) {
                        overdueCount++;
                      }

                      if (a.who) {
                        const whoKey = a.who.trim();
                        if (!actionsByWho[whoKey]) {
                          actionsByWho[whoKey] = { total: 0, completed: 0, pending: 0, inProgress: 0 };
                        }
                        actionsByWho[whoKey].total++;
                        if (a.status === 'Concluído') actionsByWho[whoKey].completed++;
                        else if (a.status === 'Em Andamento') actionsByWho[whoKey].inProgress++;
                        else actionsByWho[whoKey].pending++;
                      }
                    });
                  });
                  const actionResolutionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
                  const topActionOwners = Object.entries(actionsByWho)
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 5);

                  // Option 3: Gargalos & Ocorrências
                  const bottleneckCounts: Record<string, number> = {};
                  history.forEach(h => {
                    if (h.bottleneckProblem) {
                      const prob = h.bottleneckProblem.trim();
                      bottleneckCounts[prob] = (bottleneckCounts[prob] || 0) + 1;
                    }
                  });
                  const topBottlenecks = Object.entries(bottleneckCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                  // Option 4: Team PDIs & Recognition
                  const tagCounts: Record<string, number> = {
                    'Destaque ⭐': 0,
                    'Feedback 👍': 0,
                    'Inovação 💡': 0,
                    'Desenvolvimento 🌱': 0,
                    'Segurança / Postura 🛡️': 0,
                    'Outros 🌟': 0
                  };
                  const memberRecognitionCounts: Record<string, number> = {};
                  const listAllRecognitions: Array<{ id: string; name: string; tag: string; text: string; weekName: string; badge: any }> = [];

                  history.forEach(h => {
                    (h.teamEvolution || []).forEach((t, idx) => {
                      const parsed = parseRecognition(t.update);
                      const tagLabel = parsed.badge.label;

                      if (tagLabel.includes('Destaque')) tagCounts['Destaque ⭐']++;
                      else if (tagLabel.includes('Feedback')) tagCounts['Feedback 👍']++;
                      else if (tagLabel.includes('Inovação')) tagCounts['Inovação 💡']++;
                      else if (tagLabel.includes('Desenvolvimento') || tagLabel.includes('Melhoria')) tagCounts['Desenvolvimento 🌱']++;
                      else if (tagLabel.includes('Segurança') || tagLabel.includes('Postura')) tagCounts['Segurança / Postura 🛡️']++;
                      else tagCounts['Outros 🌟']++;

                      if (t.name) {
                        const nameKey = t.name.trim();
                        memberRecognitionCounts[nameKey] = (memberRecognitionCounts[nameKey] || 0) + 1;
                      }

                      listAllRecognitions.push({
                        id: t.id || `${h.id}-${idx}`,
                        name: t.name,
                        tag: tagLabel,
                        text: parsed.cleanText,
                        weekName: h.weekName,
                        badge: parsed.badge
                      });
                    });
                  });

                  const topRecognizedMembers = Object.entries(memberRecognitionCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                  let activeHighlightUser = 'Nenhum';
                  let maxHighlightCount = 0;
                  if (topRecognizedMembers.length > 0) {
                    activeHighlightUser = topRecognizedMembers[0][0];
                    maxHighlightCount = topRecognizedMembers[0][1];
                  }

                  return (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Sub-tab Navigation */}
                      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-px scrollbar-thin">
                        <button
                          type="button"
                          onClick={() => setAnalyticsSubTab('shifts')}
                          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                            analyticsSubTab === 'shifts'
                              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Turnos & Ritmo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalyticsSubTab('actions')}
                          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                            analyticsSubTab === 'actions'
                              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Ações 5W2H ({totalActions})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalyticsSubTab('bottlenecks')}
                          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                            analyticsSubTab === 'bottlenecks'
                              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Gargalos & Segurança</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalyticsSubTab('team')}
                          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 font-display transition shrink-0 flex items-center gap-2 cursor-pointer ${
                            analyticsSubTab === 'team'
                              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Feedbacks & PDI</span>
                        </button>
                      </div>

                      {/* SUB-TAB PANELS */}

                      {/* SECTION 1: TURNOS & RITMO */}
                      {analyticsSubTab === 'shifts' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-cyan-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Aderência Média</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${getAdherenceColor(avgAdherence).text}`}>{avgAdherence}%</span>
                                <span className="text-xs text-slate-500 font-sans">Geral</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Meta corporativa: ≥90%
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-purple-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Qualidade Média</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${getQualColor(avgQuality).text}`}>{avgQuality}%</span>
                                <span className="text-xs text-slate-500 font-mono">Aprov.</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Award className="w-3.5 h-3.5 text-purple-400" /> Meta técnica: ≥98%
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-emerald-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Turno Alta Performance</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-2xl font-display font-black text-emerald-400 uppercase tracking-tight">{bestShift}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Aderência por histórico
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-blue-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Total Reuniões Ativas</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-slate-300">{totalMeetingsLogged}</span>
                                <span className="text-xs text-slate-500 font-sans">Sincros</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Clock className="w-3.5 h-3.5 text-blue-400" /> Somas acumuladas de rotina
                              </span>
                            </div>
                          </div>

                          {/* Grid for Shift indicators & leaders */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance por Turno Table-like Block */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Desempenho Consolidado por Turno</h4>
                              </div>
                              
                              <div className="space-y-4">
                                {Object.entries(shiftMetrics).map(([sName, m]) => {
                                  const sAvgOee = m.count > 0 ? Math.round(m.oeeSum / m.count * 10) / 10 : 0;
                                  const sAvgQual = m.count > 0 ? Math.round(m.qualitySum / m.count * 10) / 10 : 0;
                                  
                                  return (
                                    <div key={sName} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-3">
                                      <div className="flex justify-between items-center">
                                        <div className="font-display font-bold text-white text-sm">{sName}</div>
                                        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">{m.count} reuniões registradas</div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-slate-900/40 border border-slate-850/60 p-2 rounded">
                                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Aderência:</div>
                                          <span className={`text-sm font-mono font-bold ${getAdherenceColor(sAvgOee).text}`}>{sAvgOee}%</span>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-850/60 p-2 rounded">
                                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Qualidade:</div>
                                          <span className={`text-sm font-mono font-bold ${getQualColor(sAvgQual).text}`}>{sAvgQual}%</span>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-850/60 p-2 rounded">
                                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Acidentes:</div>
                                          <span className={`text-sm font-mono font-bold ${m.incidents > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{m.incidents}</span>
                                        </div>
                                      </div>

                                      {/* Graphical OEE Indicator */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-slate-500">Aderência vs Meta:</span>
                                          <span className="font-bold text-slate-400">{sAvgOee}% / 90%</span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full ${getAdherenceColor(sAvgOee).bg}`}
                                            style={{ width: `${Math.min(100, sAvgOee)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Top Facilitators / Líderes */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-cyan-400" />
                                  <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Facilitadores com Mais Engajamento</h4>
                                </div>
                                <span className="text-[10px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 px-2 py-0.5 rounded">Rastreabilidade</span>
                              </div>

                              <div className="divide-y divide-slate-850 space-y-3.5 pr-1 max-h-[300px] overflow-y-auto">
                                {topLeaders.length === 0 ? (
                                  <div className="p-4 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum facilitador catalogado nas reuniões do histórico.
                                  </div>
                                ) : (
                                  topLeaders.map(([lName, count], idx) => {
                                    const percent = totalMeetingsLogged > 0 ? Math.round((count / totalMeetingsLogged) * 100) : 0;
                                    return (
                                      <div key={lName} className={`${idx > 0 ? 'pt-3' : ''} flex items-center justify-between gap-4 text-xs`}>
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                                            #{idx + 1}
                                          </div>
                                          <div>
                                            <span className="font-bold text-slate-200 block">{lName}</span>
                                            <span className="text-[10px] text-slate-500">Moderador credenciado no turno</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-mono font-bold text-cyan-400 block">{count} Reuniões</span>
                                          <span className="text-[10px] text-slate-500 font-mono">{percent}% da rotina</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Historical Trends Widget */}
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                <div>
                                  <h3 className="font-display font-semibold text-white uppercase text-xs tracking-wider">Evolução Histórica de Performance</h3>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Indicadores comparativos agregados do banco de dados</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3 h-1 rounded-full bg-cyan-400"></span>
                                  <span>Aderência ao Plano (%)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3 h-1 rounded-full bg-purple-500"></span>
                                  <span>Aprovação de Qualidade (%)</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                              {renderTrendsChart()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 2: GESTÃO DE AÇÕES 5W2H */}
                      {analyticsSubTab === 'actions' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-cyan-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Total de Ações</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-slate-300">{totalActions}</span>
                                <span className="text-xs text-slate-500 font-sans">Cadastradas</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <ListTodo className="w-3.5 h-3.5 text-cyan-400" /> Volume total acumulado
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-emerald-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Resolução Eficaz</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${actionResolutionRate >= 85 ? 'text-emerald-400' : 'text-cyan-400'}`}>{actionResolutionRate}%</span>
                                <span className="text-xs text-slate-500 font-sans">Eficácia</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Resolvidas: {completedActions} ações
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-amber-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Ações Ativas (WIP)</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-amber-400">{pendingActions + inProgressActions}</span>
                                <span className="text-xs text-slate-500 font-mono">Abertas</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Em Andamento: {inProgressActions}
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-rose-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Ações Atrasadas (Overdue)</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overdueCount}</span>
                                <span className="text-xs text-slate-500 font-sans">Atrasadas</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <AlertCircle className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} /> Ultrapassaram deadline
                              </span>
                            </div>
                          </div>

                          {/* Grid for Action list and owners */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Action Owners Performance (Who) */}
                            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Ações por Responsável</h4>
                              </div>

                              <div className="space-y-4">
                                {topActionOwners.length === 0 ? (
                                  <div className="p-4 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum responsável mapeado com ações neste histórico.
                                  </div>
                                ) : (
                                  topActionOwners.map(([oName, metrics]) => {
                                    const percent = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
                                    return (
                                      <div key={oName} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-2">
                                        <div className="flex justify-between items-baseline text-xs">
                                          <span className="font-bold text-slate-200">{oName}</span>
                                          <span className="font-mono text-slate-400 text-[10px] font-bold">
                                            {metrics.completed}/{metrics.total} Concluídas ({percent}%)
                                          </span>
                                        </div>

                                        {/* Graphic bar */}
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-cyan-500 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                          />
                                        </div>

                                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                          <span>Pendentes: {metrics.pending}</span>
                                          <span>Em Progresso: {metrics.inProgress}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Full Scrollable 5W2H Action tracker lists */}
                            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ListTodo className="w-4 h-4 text-cyan-400" />
                                  <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Histórico Unificado de Contramedidas</h4>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">Transparência Geral</span>
                              </div>

                              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {actionsList.length === 0 ? (
                                  <div className="p-6 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhuma contramedida de plano de ação catalogada no histórico.
                                  </div>
                                ) : (
                                  actionsList.map((act, index) => {
                                    const isOverdue = act.status !== 'Concluído' && act.when && act.when < todayStr;
                                    return (
                                      <div key={act.id || index} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/80 transition">
                                        <div className="space-y-1.5 max-w-sm sm:max-w-md">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-slate-500">
                                              {act.weekName}
                                            </span>
                                            <span className="font-bold text-slate-200 text-xs">O quê: {act.what}</span>
                                          </div>
                                          {act.why && (
                                            <span className="text-[10px] text-slate-400 block italic leading-tight">
                                              Porque (Causa): "{act.why}"
                                            </span>
                                          )}
                                          <div className="flex items-center gap-2.5 text-[10px] text-slate-450">
                                            <span className="flex items-center gap-1">
                                              <User className="w-3 h-3 text-cyan-400" /> Responsável: <span className="text-slate-200 font-bold">{act.who}</span>
                                            </span>
                                            <span className="flex items-center gap-1 font-mono">
                                              <Calendar className="w-3 h-3 text-cyan-400" /> Prazo: <span className={`font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>{act.when.split('-').reverse().join('/')}</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-mono font-bold border ${
                                            act.status === 'Concluído'
                                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                              : act.status === 'Em Andamento'
                                              ? 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                                              : 'bg-slate-950 text-slate-400 border-slate-850'
                                          }`}>
                                            {act.status}
                                          </span>
                                          {isOverdue && (
                                            <span className="text-[8px] uppercase font-mono font-black text-rose-400 tracking-wider flex items-center gap-1 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-500/20">
                                              <AlertCircle className="w-2.5 h-2.5 animate-pulse" /> Atrasado
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 3: BOTTLENECKS & SEGURANÇA */}
                      {analyticsSubTab === 'bottlenecks' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-emerald-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Semanas Sem Acidentes</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${safetyComplianceRate === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{safetyComplianceRate}%</span>
                                <span className="text-xs text-slate-500 font-sans">Sem Incidentes</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Planta Segura
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-rose-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Acidentes de Trabalho</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-3xl font-mono font-bold ${grandTotalIncidents > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{grandTotalIncidents}</span>
                                <span className="text-xs text-slate-500 font-sans">Ocorrências</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Histórico acumulado
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-amber-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Horas Parada de Linha</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-amber-500">{safetyStopHours}</span>
                                <span className="text-xs text-slate-500 font-sans">Horas Estimadas</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-500" /> Multiplicador: 4h p/ ocorrência
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-red-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Prejuízo por Segurança</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-xl font-mono font-bold ${safetyFinancialLoss > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                                  R$ {safetyFinancialLoss.toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <DollarSign className="w-3.5 h-3.5 text-rose-500" /> R$ {machineHourCost}/hora + R$ 300 multa
                              </span>
                            </div>
                          </div>

                          {/* Split layout: Gargalos recorrentes vs safety alert feeds */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Problem bottlenecks ranking */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Gargalos Críticos & Reincidência</h4>
                              </div>

                              <div className="space-y-3 px-1 max-h-[340px] overflow-y-auto">
                                {topBottlenecks.length === 0 ? (
                                  <div className="p-4 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum gargalo de processo registrado no histórico das reuniões.
                                  </div>
                                ) : (
                                  topBottlenecks.map(([bProb, count], idx) => {
                                    return (
                                      <div key={bProb} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs bg-slate-900 border border-slate-850 w-5 h-5 flex items-center justify-center rounded font-mono font-bold text-slate-400">
                                              #{idx + 1}
                                            </span>
                                            <span className="text-xs font-bold text-slate-200">{bProb}</span>
                                          </div>
                                          {/* Find related corrective action */}
                                          {(() => {
                                            const related = history.find(h => h.bottleneckProblem?.trim() === bProb);
                                            return related?.bottleneckAction ? (
                                              <span className="text-[10px] text-slate-400 block block leading-tight">
                                                Ação padrão: "{related.bottleneckAction}"
                                              </span>
                                            ) : null;
                                          })()}
                                        </div>

                                        <div className="text-right shrink-0">
                                          <span className="text-xs font-mono font-bold text-amber-400 block">{count} ocorrência{count > 1 ? 's' : ''}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Chronology of documented alerts / warnings */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Histórico de Alertas de Segurança</h4>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{history.length} Reuniões Mapeadas</span>
                              </div>

                              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                                {history.filter(h => h.safetyAlert || h.incidents > 0).length === 0 ? (
                                  <div className="p-6 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum aviso ou ocorrência catalogada no histórico. Planta segura!
                                  </div>
                                ) : (
                                  history.filter(h => h.safetyAlert || h.incidents > 0).map((h, i) => (
                                    <div key={h.id || i} className="p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-lg flex gap-3 text-xs justify-between items-start transition">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
                                            {h.weekName}
                                          </span>
                                          {h.incidents > 0 && (
                                            <span className="text-[8px] bg-rose-950/50 text-rose-400 border border-rose-500/20 px-1 py-0.2 rounded font-mono font-bold">
                                              {h.incidents} Acidente{h.incidents > 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-slate-350 block leading-relaxed text-[11px] italic">
                                          "{h.safetyAlert || 'Segurança Semanal Declarada ✅'}"
                                        </span>
                                      </div>
                                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${h.incidents > 0 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 4: TEAM PDI & LEADERSHIP FEEDBACKS */}
                      {analyticsSubTab === 'team' && (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-cyan-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Evoluções Registradas</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-slate-300">{listAllRecognitions.length}</span>
                                <span className="text-xs text-slate-500 font-sans">Cadastradas</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Users className="w-3.5 h-3.5 text-cyan-400" /> Histórico coletivo mapeado
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-amber-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Destaques ⭐ Emitidos</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-amber-400">{tagCounts['Destaque ⭐']}</span>
                                <span className="text-xs text-slate-500 font-sans">Destaques</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Medalha da excelência
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-purple-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Ideias & Inovações</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-mono font-bold text-purple-400">{tagCounts['Inovação 💡']}</span>
                                <span className="text-xs text-slate-500 font-mono">Inovadores</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Award className="w-3.5 h-3.5 text-purple-400" /> Sugestões implantadas
                              </span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col gap-1 hover:border-emerald-500/30 transition">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Fera dos Reconhecimentos</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-lg font-display font-black text-emerald-400 uppercase tracking-tight truncate max-w-[150px]" title={activeHighlightUser}>
                                  {activeHighlightUser}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
                                <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> {maxHighlightCount} menções no banco
                              </span>
                            </div>
                          </div>

                          {/* Grid ranking vs scrollable praises */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Ranking Operator Recognition */}
                            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2">
                                <Award className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Líderes de Reconhecimento</h4>
                              </div>

                              <div className="space-y-4">
                                {topRecognizedMembers.length === 0 ? (
                                  <div className="p-4 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum reconhecimento atribuído a colaboradores nas pastas históricas.
                                  </div>
                                ) : (
                                  topRecognizedMembers.map(([mName, count], idx) => {
                                    return (
                                      <div key={mName} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs select-none">
                                            #{idx + 1}
                                          </div>
                                          <div>
                                            <span className="font-bold text-slate-200 block">{mName}</span>
                                            <span className="text-[10px] text-slate-500">Membro destacado do turno</span>
                                          </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                          <span className="text-xs font-mono font-bold text-cyan-400 block">{count} Menç{count > 1 ? 'ões' : 'ão'}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Feed of structural praise notes */}
                            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                              <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-cyan-400" />
                                  <h4 className="font-display text-xs font-semibold text-white uppercase tracking-wider">Feed unificado de Clima e Desenvolvimento</h4>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">Atitudes & Reconhecimento</span>
                              </div>

                              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                                {listAllRecognitions.length === 0 ? (
                                  <div className="p-6 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
                                    Nenhum elogio, PDI, ou aviso de clima registrado no histórico de reuniões.
                                  </div>
                                ) : (
                                  listAllRecognitions.map((item) => (
                                    <div key={item.id} className="p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-lg flex justify-between gap-4 items-start transition">
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${item.badge.bg} ${item.badge.text} ${item.badge.border} font-bold font-mono`}>
                                            {item.badge.label}
                                          </span>
                                        </div>
                                        <span className="text-slate-400 block text-[11px] leading-relaxed italic">
                                          "{item.text}"
                                        </span>
                                      </div>
                                      <span className="text-[9px] bg-slate-900/40 text-cyan-500 border border-slate-850 px-2.5 py-0.5 rounded font-mono shrink-0 select-none">
                                        {item.weekName}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* --- ACTION PLAN KANBAN WORKSPACE TAB --- */}
                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    {/* Add action counter-measure subform */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
                      <div className="border-b border-slate-850 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ListTodo className="w-5 h-5 text-cyan-400" />
                          <div>
                            <h3 className="font-display font-semibold text-white uppercase text-xs tracking-wider">Injetar Nova Contramedida (Plano de Ação 5W2H)</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Assegure a rastreabilidade definindo claramente o O que, Quem e Quando dás correções</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 px-2.5 py-0.5 rounded uppercase font-mono font-bold">Mapeamento Dinâmico</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">O Que (Ação recomendada):</label>
                          <input
                            type="text"
                            value={newActionWhat}
                            onChange={(e) => setNewActionWhat(e.target.value)}
                            placeholder="Ex: Instalar proteção de acrílico no painel hidráulico da prensa"
                            className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Quem (Responsável):</label>
                          <input
                            type="text"
                            value={newActionWho}
                            onChange={(e) => setNewActionWho(e.target.value)}
                            placeholder="Ex: Roberto Silva"
                            className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Quando (Prazo):</label>
                          <input
                            type="date"
                            value={newActionWhen}
                            onChange={(e) => setNewActionWhen(e.target.value)}
                            className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-3">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Por Que / Causa Raiz relacionado:</label>
                          <input
                            type="text"
                            value={newActionWhy}
                            onChange={(e) => setNewActionWhy(e.target.value)}
                            placeholder="Ex: Eliminar perigo potencial de pinçamento identificado em auditoria semanal"
                            className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={handleAddAction5W2H}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            Programar Ação
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Kanban Board columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* PENDENTE COLUMN */}
                      <div className="bg-[#0e121a] border border-[#232938] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-[#181d29]/60 px-3 py-2.5 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider">A Fazer / Pendente</h4>
                          </div>
                          <span className="bg-amber-950/40 text-amber-500 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            {actions5w2h.filter(a => a.status === 'Pendente').length}
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {actions5w2h.filter(a => a.status === 'Pendente').length === 0 ? (
                            <div className="p-10 border border-dashed border-slate-800/80 rounded-lg text-center text-[11px] text-slate-500">
                              Sem ações pendentes para esta pauta.
                            </div>
                          ) : (
                            actions5w2h.filter(a => a.status === 'Pendente').map(a => renderKanbanCard(a))
                          )}
                        </div>
                      </div>

                      {/* EM ANDAMENTO COLUMN */}
                      <div className="bg-[#0e121a] border border-[#232938] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-[#181d29]/60 px-3 py-2.5 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <h4 className="font-display font-bold text-xs text-cyan-400 uppercase tracking-wider">Em Execução</h4>
                          </div>
                          <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            {actions5w2h.filter(a => a.status === 'Em Andamento').length}
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {actions5w2h.filter(a => a.status === 'Em Andamento').length === 0 ? (
                            <div className="p-10 border border-dashed border-slate-800/80 rounded-lg text-center text-[11px] text-slate-500">
                              Nenhuma ação em andamento ativo.
                            </div>
                          ) : (
                            actions5w2h.filter(a => a.status === 'Em Andamento').map(a => renderKanbanCard(a))
                          )}
                        </div>
                      </div>

                      {/* CONCLUÍDO COLUMN */}
                      <div className="bg-[#0e121a] border border-[#232938] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-[#181d29]/60 px-3 py-2.5 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <h4 className="font-display font-bold text-xs text-emerald-400 uppercase tracking-wider font-bold">Concluído</h4>
                          </div>
                          <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            {actions5w2h.filter(a => a.status === 'Concluído').length}
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {actions5w2h.filter(a => a.status === 'Concluído').length === 0 ? (
                            <div className="p-10 border border-dashed border-slate-800/80 rounded-lg text-center text-[11px] text-slate-500">
                              Nenhum plano fechado nesta semana útil.
                            </div>
                          ) : (
                            actions5w2h.filter(a => a.status === 'Concluído').map(a => renderKanbanCard(a))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* --- ROI / LOSS ESTIMATION WORKSPACE TAB --- */}
                {activeTab === 'roi' && (
                  <div className="space-y-6">
                    {/* Setup Parameters Header */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
                      <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-amber-500" />
                          <div>
                            <h3 className="font-display font-semibold text-white uppercase text-xs tracking-wider">Módulo de Perdas Industriais & ROI (Indicador Financeiro)</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Defina os parâmetros financeiros específicos de sua fábrica para levantar o impacto monetário real de cada desperfício</p>
                          </div>
                        </div>
                      </div>

                      {/* Sliding scales */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2 p-3 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-350">
                            <span>Valor Desvio Volume (R$/unidade)</span>
                            <span className="text-cyan-400 font-mono font-bold">R$ {costPerUnit},00</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="150"
                            step="1"
                            value={costPerUnit}
                            onChange={(e) => setCostPerUnit(Number(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
                          />
                          <span className="text-[9px] text-slate-550 block leading-tight">Gera custo de oportunidade sobre peças planejadas não produzidas</span>
                        </div>

                        <div className="space-y-2 p-3 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-350">
                            <span>Hora Máquina Parada (Setup/Falhas)</span>
                            <span className="text-cyan-400 font-mono font-bold">R$ {machineHourCost},00</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="2000"
                            step="25"
                            value={machineHourCost}
                            onChange={(e) => setMachineHourCost(Number(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
                          />
                          <span className="text-[9px] text-slate-550 block leading-tight">Custo por ociosidade operacional física nas linhas críticas por hora de quebra</span>
                        </div>

                        <div className="space-y-2 p-3 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-350">
                            <span>Fração Perda Qualidade (R$/%)</span>
                            <span className="text-cyan-400 font-mono font-bold">R$ {scrapCostPercentage},00</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="1000"
                            step="10"
                            value={scrapCostPercentage}
                            onChange={(e) => setScrapCostPercentage(Number(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
                          />
                          <span className="text-[9px] text-slate-550 block leading-tight">Prevenção por refugo de matérias primas desviadas</span>
                        </div>
                      </div>
                    </div>

                    {/* Estimates layout */}
                    {(() => {
                      const totalPlannedVol = productionPlans.reduce((sum, p) => sum + (Number(p.planned) || 0), 0);
                      const totalRealVol = productionPlans.reduce((sum, p) => sum + (Number(p.realized) || 0), 0);
                      const unitDeficit = Math.max(0, totalPlannedVol - totalRealVol);
                      const volumeLossCost = unitDeficit * costPerUnit;

                      const qualityGap = Math.max(0, 100 - qualityApproval);
                      const qualityLossCost = qualityGap * scrapCostPercentage;

                      const safetyStopHours = incidents * 4;
                      const safetyLostCost = safetyStopHours * machineHourCost + (incidents * 300);

                      const grandTotalIndustrialLoss = volumeLossCost + qualityLossCost + safetyLostCost;
                      const estimatedRecoupedValue = Math.round(grandTotalIndustrialLoss * 0.85);

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          <div className="lg:col-span-2 bg-[#0d1017] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest">
                              <AlertTriangle className="w-5 h-5 text-rose-500" />
                              Relatório Operacional de Risco e Desperdício Financeiro
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Volume Não Produzido</span>
                                <span className="text-sm font-mono font-bold text-slate-400 mt-1">{unitDeficit} unidades</span>
                                <span className="text-lg font-mono font-bold text-rose-400 mt-1">R$ {volumeLossCost.toLocaleString('pt-BR')}</span>
                                <span className="text-[9px] text-slate-500 mt-1">Deficit de Aderência do Plano</span>
                              </div>

                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Refugo / Perda de Qualidade</span>
                                <span className="text-sm font-mono font-bold text-slate-400 mt-1">{-qualityGap.toFixed(1)}% Desvio</span>
                                <span className="text-lg font-mono font-bold text-rose-400 mt-1">R$ {qualityLossCost.toLocaleString('pt-BR')}</span>
                                <span className="text-[9px] text-slate-500 mt-1">Custo com rejeitos de Linha</span>
                              </div>

                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Downtime de Paradas</span>
                                <span className="text-sm font-mono font-bold text-slate-400 mt-1">{safetyStopHours} horas estimadas</span>
                                <span className="text-lg font-mono font-bold text-rose-400 mt-1">R$ {safetyLostCost.toLocaleString('pt-BR')}</span>
                                <span className="text-[9px] text-slate-500 mt-1">Ociosidade por desvios</span>
                              </div>
                            </div>

                            <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl flex justify-between items-center flex-wrap gap-4">
                              <div>
                                <span className="text-xs uppercase text-slate-400 block font-semibold">Prejuízo Mensal Projetado da Semana Atual:</span>
                                <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Soma estimada de desvios se sustentados estavelmente no mês</span>
                              </div>
                              <span className="text-3xl font-mono font-extrabold text-rose-500">R$ {grandTotalIndustrialLoss.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>

                          <div className="lg:col-span-1 bg-[#0b1c24] border border-cyan-500/20 rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6">
                            <div className="space-y-4">
                              <span className="text-xs font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                Retorno Comercial de Produtividade (ROI)
                              </span>
                              <p className="text-xs text-slate-350 leading-relaxed">
                                Ao implantarem as contramedidas estruturadas de nossa solução e conterem perdas crônicas em média <strong className="text-cyan-400">85%</strong>, a planta operacional de Danilo Henrique blindará:
                              </p>

                              <div className="p-4 bg-slate-950/40 border border-cyan-500/10 rounded-xl">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Capital Operacional Líquido Blindado:</span>
                                <span className="text-3xl font-mono font-bold text-cyan-400">R$ {estimatedRecoupedValue.toLocaleString('pt-BR')}</span>
                                <span className="text-[9px] text-slate-550 block mt-1">Dinheiro preservado na conta corporativa</span>
                              </div>

                              <div className="flex gap-4 text-xs font-sans text-slate-400 pt-1">
                                <div className="space-y-1">
                                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Invest. Típico</span>
                                  <span className="block font-bold text-white font-mono">R$ 2.500</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Payback Est.</span>
                                  <span className="block font-bold text-white font-mono">Médio 14 Dias!</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleCopyFormattedReport}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              COPIAR SUMÁRIO EXECUTIVO (WhatsApp)
                            </button>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* --- CONTROL FOOTER BUTTONS --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-5 gap-4">
                  <div>
                    {selectedMeeting && (
                      <button
                        type="button"
                        onClick={triggerDelete}
                        disabled={isSaving}
                        className="cursor-pointer text-sm font-semibold text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-505 bg-rose-950/20 hover:bg-rose-600 px-4 py-2.5 rounded-lg transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir Reunião Física do Banco
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleNewMeeting}
                      className="cursor-pointer flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-700 text-slate-350 border border-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                      Cancelar / Limpar
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveOrUpdate}
                      disabled={isSaving}
                      className="cursor-pointer flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg"
                      id="save-meeting-btn"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Gravando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {selectedMeeting ? 'Atualizar Registro' : 'Salvar Registro no Banco'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
      
    </div>
  );
}
