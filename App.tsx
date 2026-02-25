
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, User as UserIcon, Check, X, Sparkles, LogOut, Moon, Sun as SunIcon,
  Award, Flame, ChevronRight, Trophy, Clock, MessageSquare, Zap, Plus, TrendingUp, UserCheck, Calendar as CalendarIcon, Languages, Settings, Target, ArrowRight,
  Camera, ShieldCheck, Lock, Edit3, Save, Search, Lightbulb, Smile, Frown, Meh, Heart, List
} from 'lucide-react';
import { Logo } from './components/Logo';
import { StatsChart } from './components/StatsChart';
import { HABIT_COLORS, Habit, User, ViewState, Language, MoodType, MoodEntry } from './types';
import { analyzeHabitDifficulty, getMotivationalQuote, getAIAdvice, generateSuggestedHabits, discoverAIHabits } from './services/geminiService';
import { storageService } from './services/storageService';

const translations = {
  es: {
    login: "Entrar", register: "Regístrate", email: "Email", userOrEmail: "Email o Usuario",
    password: "Contraseña", username: "Nombre de Usuario", name: "Nombre Completo", noAccount: "¿No tienes cuenta?",
    home: "Inicio", ranking: "Ranking", advisor: "Mentor IA", profile: "Perfil", history: "Historial",
    discover: "Descubrir IA", mood: "Mood Tracker",
    greeting: "¡A tope, {name}!", yourHabits: "Tus Hábitos", days: "días", add: "Añadir",
    newHabit: "Nuevo Hábito", createHabit: "Crear Hábito", analyzing: "Analizando...",
    errWrongPass: "Credenciales incorrectas", errPassShort: "Mínimo 6 caracteres", errUserTaken: "Usuario o Email ya registrado",
    errLimitReached: "Has alcanzado el límite de 5 hábitos del plan gratuito.",
    errDuplicateHabit: "Ya tienes un hábito con este nombre.",
    dailySummary: "Resumen Diario", progress: "Progreso",
    startNow: "Empezar ahora", landingTitle: "Transforma tu vida, hábito a hábito.", landingDesc: "La aplicación definitiva para gamificar tu crecimiento personal con IA.",
    loginWithGoogle: "Entrar con Google", accessAsGuest: "Entrar como Invitado",
    onboardingTitle: "Configura tu Flujo", onboardingDesc: "Responde estas breves preguntas para que nuestra IA diseñe tu camino ideal.",
    goalLabel: "¿Cuál es tu objetivo principal?", energyLabel: "¿En qué momento del día tienes más energía?",
    intensityLabel: "¿Cuánta intensidad buscas?",
    generateSuggestions: "Generar Sugerencias", accept: "Aceptar", decline: "Rechazar",
    activeStreak: "Racha Activa", rewards: "Recompensas", language: "Idioma", darkMode: "Modo Oscuro",
    stats: "Estadísticas", totalXp: "XP Total", level: "Nivel", habitsCompleted: "Completados",
    jan: "Ene", feb: "Feb", mar: "Mar", apr: "Abr", may: "May", jun: "Jun", jul: "Jul", aug: "Ago", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dic",
    selectPlan: "Selecciona tu Plan", freeDesc: "Ideal para empezar", proDesc: "Para los comprometidos", premiumDesc: "Máximo rendimiento con IA",
    limit5: "Límite de 5 hábitos", unlimited: "Hábitos ilimitados", friendsRanking: "Ranking con amigos", aiAccess: "Acceso a Mentor IA Gemini",
    getStarted: "Empezar", upgrade: "Mejorar", saveChanges: "Guardar", profileUpdated: "Perfil actualizado",
    discoverTitle: "AI Habit Lab", discoverDesc: "Senderos optimizados por nuestra IA.",
    choosePath: "Elige tu Senda", moodTitle: "Estado de Ánimo", moodDesc: "¿Cómo va ese flujo mental?", moodPlaceholder: "Escribe tus pensamientos...",
    saveMood: "Guardar Registro", habitsTab: "Hábitos", moodTab: "Ánimo",
    currentPlan: "Plan Actual", changePlan: "Cambiar Plan"
  },
  en: {
    login: "Login", register: "Register", email: "Email", userOrEmail: "Email or Username",
    password: "Password", username: "Username", name: "Full Name", noAccount: "Don't have an account?",
    home: "Home", ranking: "Ranking", advisor: "AI Mentor", profile: "Profile", history: "History",
    discover: "AI Discover", mood: "Mood Tracker",
    greeting: "Let's go, {name}!", yourHabits: "Your Habits", days: "days", add: "Add",
    newHabit: "New Habit", createHabit: "Create Habit", analyzing: "Analyzing...",
    errWrongPass: "Incorrect credentials", errPassShort: "Min 6 characters", errUserTaken: "User/Email already exists",
    errLimitReached: "You've reached the 5-habit limit of the free plan.",
    errDuplicateHabit: "You already have a habit with this name.",
    dailySummary: "Daily Summary", progress: "Progress",
    startNow: "Start Now", landingTitle: "Transform your life, habit by habit.", landingDesc: "The ultimate app to gamify your personal growth with AI.",
    loginWithGoogle: "Login with Google", accessAsGuest: "Guest Access",
    onboardingTitle: "Setup Your Flow", onboardingDesc: "Answer these brief questions so our AI can design your ideal path.",
    goalLabel: "What is your main goal?", energyLabel: "When do you have the most energy?",
    intensityLabel: "How much intensity are you looking for?",
    generateSuggestions: "Generate Suggestions", accept: "Accept", decline: "Decline",
    activeStreak: "Active Streak", rewards: "Rewards", language: "Language", darkMode: "Dark Mode",
    stats: "Statistics", totalXp: "Total XP", level: "Level", habitsCompleted: "Completed",
    jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun", jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
    selectPlan: "Select Your Plan", freeDesc: "Perfect to start", proDesc: "For the committed", premiumDesc: "Max performance with AI",
    limit5: "5 habits limit", unlimited: "Unlimited habits", friendsRanking: "Friends ranking", aiAccess: "Gemini AI Mentor access",
    getStarted: "Get Started", upgrade: "Upgrade", saveChanges: "Save", profileUpdated: "Profile updated",
    discoverTitle: "AI Habit Lab", discoverDesc: "AI optimized habit paths.",
    choosePath: "Choose Path", moodTitle: "Mood", moodDesc: "How's your mental flow?", moodPlaceholder: "Write your thoughts...",
    saveMood: "Save Entry", habitsTab: "Habits", moodTab: "Mood",
    currentPlan: "Current Plan", changePlan: "Change Plan"
  }
};

const MOODS_CONFIG: { type: MoodType, icon: any, color: string }[] = [
  { type: 'Muy triste', icon: Frown, color: 'text-blue-700' },
  { type: 'Triste', icon: Frown, color: 'text-blue-400' },
  { type: 'Neutral', icon: Meh, color: 'text-gray-400' },
  { type: 'Feliz', icon: Smile, color: 'text-brand-lime' },
  { type: 'Alegre', icon: Smile, color: 'text-yellow-400' },
  { type: 'Excelente', icon: Heart, color: 'text-pink-500' },
];

const OptionButton: React.FC<{ label: string, value: string, current: string, onClick: (v: string) => void }> = ({ label, value, current, onClick }) => (
  <button 
    onClick={() => onClick(value)} 
    className={`w-full p-4 rounded-2xl border-2 text-left flex justify-between items-center group transition-all duration-300 ${current === value ? 'border-brand-lime bg-brand-lime/10' : 'border-white/5 bg-brand-gray/30 text-gray-500 hover:border-white/10'}`}
  >
    <span className={`text-sm font-display font-bold uppercase tracking-tight ${current === value ? 'text-brand-lime' : 'group-hover:text-white'}`}>{label}</span>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${current === value ? 'border-brand-lime bg-brand-lime text-black' : 'border-white/10'}`}>
      {current === value && <Check size={10} strokeWidth={4} />}
    </div>
  </button>
);

// Fix: Missing PlanSelection component implementation
const PlanSelection = ({ curT, onSelect }: { curT: any, onSelect: (p: 'free' | 'basic' | 'premium') => void }) => {
  const plans: { id: 'free' | 'basic' | 'premium', title: string, price: string, desc: string, items: string[] }[] = [
    { id: 'free', title: 'Free', price: '$0', desc: curT.freeDesc, items: [curT.limit5] },
    { id: 'basic', title: 'Basic', price: '$9', desc: curT.proDesc, items: [curT.unlimited, curT.friendsRanking] },
    { id: 'premium', title: 'Premium', price: '$19', desc: curT.premiumDesc, items: [curT.unlimited, curT.friendsRanking, curT.aiAccess] },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <h2 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-4 text-center">{curT.selectPlan}</h2>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {plans.map(p => (
          <div key={p.id} className="bg-brand-gray/30 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center space-y-6 hover:border-brand-lime/30 transition-all">
            <h3 className="text-3xl font-display font-bold uppercase">{p.title}</h3>
            <div className="text-5xl font-display font-bold text-brand-lime">{p.price}<span className="text-xs text-gray-500">/mo</span></div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.desc}</p>
            <ul className="space-y-3 w-full">
              {p.items.map((item, i) => (
                <li key={i} className="text-[10px] font-bold uppercase text-gray-500 flex items-center justify-center gap-2"><Check size={12} className="text-brand-lime"/> {item}</li>
              ))}
            </ul>
            <button onClick={() => onSelect(p.id)} className="w-full bg-brand-lime text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] mt-auto shadow-lg hover:scale-105 transition-all">{curT.getStarted}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fix: Missing Onboarding component implementation
const Onboarding = ({ user, curT, onComplete }: { user: User, curT: any, onComplete: (suggested: any[]) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goal: '', energy: '', intensity: '' });
  const [loading, setLoading] = useState(false);

  const steps = [
    { key: 'goal', label: curT.goalLabel, options: [{l: 'Salud', v: 'health'}, {l: 'Foco', v: 'focus'}, {l: 'Paz', v: 'peace'}] },
    { key: 'energy', label: curT.energyLabel, options: [{l: 'Mañana', v: 'morning'}, {l: 'Tarde', v: 'afternoon'}, {l: 'Noche', v: 'night'}] },
    { key: 'intensity', label: curT.intensityLabel, options: [{l: 'Chill', v: 'low'}, {l: 'Medio', v: 'medium'}, {l: 'Hardcore', v: 'high'}] },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      setLoading(true);
      const suggested = await generateSuggestedHabits(answers, user.language);
      onComplete(suggested);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
      <Sparkles size={48} className="text-brand-lime animate-spin-slow mb-4" />
      <p className="font-display font-bold uppercase tracking-widest text-lg">{curT.analyzing}</p>
    </div>
  );

  const current = steps[step];

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-700">
      <h2 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-4 leading-none">{curT.onboardingTitle}</h2>
      <p className="text-gray-500 font-bold uppercase tracking-[0.4em] mb-12 text-[9px]">{curT.onboardingDesc}</p>
      
      <div className="space-y-8">
        <p className="text-xl font-display font-bold uppercase">{current.label}</p>
        <div className="grid gap-4">
          {current.options.map(opt => (
            <OptionButton 
              key={opt.v} 
              label={opt.l} 
              value={opt.v} 
              current={(answers as any)[current.key]} 
              onClick={(v) => setAnswers({...answers, [current.key]: v})} 
            />
          ))}
        </div>
        <button 
          onClick={handleNext} 
          disabled={!(answers as any)[current.key]}
          className="w-full bg-brand-lime text-black py-5 rounded-2xl font-bold uppercase tracking-[0.4em] text-[10px] shadow-xl disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {step === steps.length - 1 ? curT.generateSuggestions : 'Siguiente'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Fix: Missing AIChat component implementation
const AIChat = ({ user, curT }: { user: User, curT: any }) => {
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    const response = await getAIAdvice(input, messages, user.language);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-brand-gray/30 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl animate-in zoom-in duration-700">
      <header className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{curT.advisor}</h2>
          <p className="text-[8px] font-bold text-brand-lime uppercase tracking-[0.4em] mt-1">Impulsado por Gemini 3 Flash</p>
        </div>
        <Sparkles className="text-brand-lime animate-pulse" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">¿Cómo puedo ayudarte con tus hábitos hoy?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-2xl text-xs font-sans leading-relaxed ${m.role === 'user' ? 'bg-brand-lime text-black font-bold' : 'bg-black/40 text-gray-300 border border-white/5'}`}>
              {m.parts[0].text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/40 p-5 rounded-2xl animate-pulse flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
              <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
              <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu consulta..."
          className="flex-1 bg-gray-100 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-6 py-4 text-xs outline-none focus:border-brand-lime/30 text-black dark:text-white"
        />
        <button 
          disabled={!input.trim() || loading}
          className="bg-brand-lime text-black p-4 rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-20"
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

const MoodTrackerView = ({ user, onSaveMood, curT }: { user: User, onSaveMood: (entry: MoodEntry) => void, curT: any }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selectedMood) return;
    onSaveMood({ date: new Date().toISOString(), mood: selectedMood, note });
    setSelectedMood(null);
    setNote('');
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-2xl mx-auto lg:mt-10">
      <h1 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-2 leading-none">{curT.moodTitle}</h1>
      <p className="text-gray-500 font-bold uppercase tracking-[0.4em] mb-10 text-[9px]">{curT.moodDesc}</p>

      <div className="bg-brand-gray/30 p-8 rounded-[2.5rem] border border-white/5 space-y-10 shadow-xl">
        <div className="grid grid-cols-3 gap-4">
          {MOODS_CONFIG.map((m) => {
            const IconComp = m.icon;
            return (
              <button 
                key={m.type} 
                onClick={() => setSelectedMood(m.type)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${selectedMood === m.type ? 'bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10' : 'opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gray-200 dark:bg-black flex items-center justify-center ${m.color}`}>
                  <IconComp size={24} />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-center text-black dark:text-white">{m.type}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={curT.moodPlaceholder}
            className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl min-h-[150px] outline-none focus:border-brand-lime/30 text-sm font-sans"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={!selectedMood}
          className="w-full bg-brand-lime text-black py-4 rounded-2xl font-bold uppercase tracking-[0.3em] shadow-xl disabled:opacity-10 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs"
        >
          <Save size={16} /> {curT.saveMood}
        </button>
      </div>
    </div>
  );
};

const AIDiscoverView = ({ user, habits, onAddHabit, curT }: { user: User, habits: Habit[], onAddHabit: (h: any) => void, curT: any }) => {
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const paths = [
    { id: 'focus', label: 'Enfoque Profundo', icon: Target, color: 'text-blue-500' },
    { id: 'health', label: 'Cuerpo Vital', icon: Flame, color: 'text-orange-500' },
    { id: 'peace', label: 'Calma Interior', icon: Moon, color: 'text-purple-500' },
    { id: 'power', label: 'Productividad Elite', icon: Zap, color: 'text-brand-lime' },
  ];

  const handleDiscover = async (cat: string) => {
    setCategory(cat);
    setLoading(true);
    setOptions([]);
    try {
      const results = await discoverAIHabits(cat, user.language);
      setOptions(results);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
      <h1 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-2 leading-none">{curT.discoverTitle}</h1>
      <p className="text-gray-500 font-bold uppercase tracking-[0.4em] mb-12 text-[9px]">{curT.discoverDesc}</p>

      {!category && (
        <div className="grid gap-4 sm:grid-cols-2">
          {paths.map(p => (
            <button key={p.id} onClick={() => handleDiscover(p.label)} className="w-full bg-brand-gray/30 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-brand-lime/40 transition-all">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl bg-black flex items-center justify-center ${p.color}`}><p.icon size={24} /></div>
                <span className="text-xl font-display font-bold uppercase">{p.label}</span>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-brand-lime" />
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <Sparkles size={48} className="text-brand-lime animate-spin-slow mb-4" />
          <p className="font-display font-bold uppercase tracking-widest text-lg">{curT.analyzing}</p>
        </div>
      )}

      {options.length > 0 && (
        <div className="space-y-6">
          <button onClick={() => setCategory('')} className="text-gray-500 font-bold uppercase tracking-widest text-[8px] hover:text-white flex items-center gap-2"><ChevronRight size={12} className="rotate-180" /> Volver</button>
          <div className="grid gap-4">
            {options.map((opt, i) => (
              <div key={i} className="bg-brand-gray/40 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-brand-lime/30 transition-all gap-8">
                <div className="flex-1">
                  <div className="flex gap-3 mb-3">
                    <span className="px-3 py-1 bg-black rounded-full text-[8px] font-bold uppercase text-brand-lime border border-brand-lime/10">{opt.difficulty}</span>
                    <span className="px-3 py-1 bg-black rounded-full text-[8px] font-bold uppercase text-purple-400">+{opt.xp} XP</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase text-white mb-1">{opt.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{opt.description}</p>
                </div>
                <button onClick={() => onAddHabit(opt)} className="bg-brand-lime text-black w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"><Plus size={24} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const History = ({ user, habits, curT }: { user: User, habits: Habit[], curT: any }) => {
  const [tab, setTab] = useState<'habits' | 'mood'>('habits');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = [curT.jan, curT.feb, curT.mar, curT.apr, curT.may, curT.jun, curT.jul, curT.aug, curT.sep, curT.oct, curT.nov, curT.dec];

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-6xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-none">{curT.history}</h1>
        <div className="flex bg-brand-gray/50 p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => setTab('habits')} className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${tab === 'habits' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500'}`}>{curT.habitsTab}</button>
          <button onClick={() => setTab('mood')} className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${tab === 'mood' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500'}`}>{curT.moodTab}</button>
        </div>
      </header>

      {tab === 'habits' ? (
        <div className="animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-6 bg-brand-gray/30 p-4 rounded-2xl border border-white/5 mb-8 w-fit mx-auto md:mx-0">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:text-brand-lime"><ChevronRight size={18} className="rotate-180"/></button>
            <span className="font-display font-bold uppercase tracking-widest text-sm min-w-[120px] text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:text-brand-lime"><ChevronRight size={18}/></button>
          </div>
          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
              const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
              const total = habits.length;
              const pct = total > 0 ? (completed / total) : 0;
              return (
                <div key={i} className={`aspect-square rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all text-sm font-display font-bold ${pct === 1 ? 'bg-brand-lime text-black border-brand-lime' : pct > 0.5 ? 'bg-brand-lime/30 border-brand-lime/40' : pct > 0 ? 'bg-brand-lime/10 border-brand-lime/20' : 'bg-brand-gray/20 border-white/5 text-gray-700'}`}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right duration-500 space-y-4">
          {user.moodLogs?.length ? (
            user.moodLogs.slice().reverse().map((entry, idx) => {
              const moodInfo = MOODS_CONFIG.find(m => m.type === entry.mood);
              const MoodIcon = moodInfo?.icon || Meh;
              return (
                <div key={idx} className="bg-brand-gray/30 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="flex items-center gap-4 min-w-[150px]">
                    <div className={`w-10 h-10 rounded-xl bg-black flex items-center justify-center ${moodInfo?.color}`}>
                      <MoodIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-lime uppercase tracking-widest leading-none mb-1">{entry.mood}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 italic text-xs border-l border-white/10 pl-6 flex-1 line-clamp-3">"{entry.note || 'Sin reflexiones.'}"</p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-brand-gray/10 rounded-3xl border border-dashed border-white/10">
              <Smile size={40} className="mx-auto text-gray-700 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">No hay registros de ánimo todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [motivation, setMotivation] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [profileImg, setProfileImg] = useState<string | null>(null);

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const curT = user ? (translations[user.language] || translations.es) : translations.es;

  useEffect(() => {
    const sessionUser = storageService.getCurrentSessionUser();
    if (sessionUser) {
      setUser(sessionUser);
      setHabits(storageService.loadHabits(sessionUser.email));
      setEditName(sessionUser.name);
      setEditUsername(sessionUser.username);
      setProfileImg(sessionUser.profileImage || null);
      if (!sessionUser.subscriptionPlan) setView('SUBSCRIPTION_SETUP');
      else if (!sessionUser.onboardingCompleted) setView('ONBOARDING');
      else setView('HOME');
      setIsDarkMode(sessionUser.darkMode);
    }
    setAllUsers(storageService.getAllUsers());
  }, []);

  useEffect(() => {
    if (user && view === 'HOME') {
      const fetchMotivation = async () => {
        const completedCount = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;
        const quote = await getMotivationalQuote(user.name, completedCount, user.language);
        setMotivation(quote);
      };
      fetchMotivation();
    }
  }, [user, view, habits]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = storageService.authenticate(loginId, loginPass);
    if (u) {
      setUser(u); setHabits(storageService.loadHabits(u.email)); 
      setEditName(u.name); setEditUsername(u.username); setProfileImg(u.profileImage || null);
      if (!u.subscriptionPlan) setView('SUBSCRIPTION_SETUP');
      else if (!u.onboardingCompleted) setView('ONBOARDING');
      else setView('HOME');
      setIsDarkMode(u.darkMode); setErrorMsg(null);
    } else { setErrorMsg(curT.errWrongPass); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); if (regPass.length < 6) { setErrorMsg(curT.errPassShort); return; }
    if (storageService.findUser(regEmail) || storageService.findUser(regUser)) { setErrorMsg(curT.errUserTaken); return; }
    const newUser: User = { name: regName, username: regUser, email: regEmail, password: regPass, level: 1, currentXp: 0, nextLevelXp: 1000, totalXp: 0, darkMode: true, language: 'es', subscriptionPlan: 'free', onboardingCompleted: false, moodLogs: [] };
    storageService.saveUser(newUser); setUser(newUser); setHabits([]); 
    setEditName(newUser.name); setEditUsername(newUser.username);
    setView('SUBSCRIPTION_SETUP'); setErrorMsg(null);
  };

  const handleLogout = () => { storageService.logout(); setUser(null); setHabits([]); setView('LANDING'); };

  const handleGuestLogin = () => {
    const guestUser: User = { 
      name: 'Invitado', username: 'guest' + Math.floor(Math.random() * 1000), email: `guest_${Date.now()}@temp.com`, 
      level: 1, currentXp: 0, nextLevelXp: 1000, totalXp: 0, darkMode: true, language: 'es', subscriptionPlan: 'free', onboardingCompleted: false, isGuest: true, moodLogs: []
    };
    storageService.saveUser(guestUser); setUser(guestUser); setHabits([]); setView('SUBSCRIPTION_SETUP'); setErrorMsg(null);
  };

  const handleUpdateProfile = () => {
    if (!user) return;
    const updatedUser = { ...user, name: editName, username: editUsername, profileImage: profileImg || undefined };
    storageService.saveUser(updatedUser); setUser(updatedUser); setSuccessMsg(curT.profileUpdated);
    setTimeout(() => setSuccessMsg(null), 3000); setAllUsers(storageService.getAllUsers());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMood = (entry: MoodEntry) => {
    if (!user) return;
    const updatedUser = { ...user, moodLogs: [...(user.moodLogs || []), entry] };
    storageService.saveUser(updatedUser); setUser(updatedUser);
    setSuccessMsg("¡Mood registrado!"); setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => {
      const newHabits = prev.map(h => {
        if (h.id === id) {
          const done = h.completedDates.includes(today); 
          return { ...h, completedDates: done ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today], streak: done ? Math.max(0, h.streak - 1) : h.streak + 1 };
        }
        return h;
      });
      if (user) storageService.saveHabits(user.email, newHabits);
      return newHabits;
    });
  };

  const changeLanguage = (l: Language) => {
    if (user) { const updated = {...user, language: l}; setUser(updated); storageService.saveUser(updated); }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (user) {
      const updated = { ...user, darkMode: newMode };
      setUser(updated);
      storageService.saveUser(updated);
    }
  };

  const completedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;

  const RightSidebar = () => (
    <div className="hidden xl:flex flex-col w-72 h-screen fixed right-0 top-0 bg-white dark:bg-brand-gray border-l dark:border-white/5 p-8 overflow-y-auto z-40">
      <div className="space-y-8">
        <div>
          <h4 className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">{curT.activeStreak}</h4>
          <div className="bg-gray-100 dark:bg-black p-6 rounded-2xl flex items-center gap-4 border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Flame size={20} /></div>
            <div><p className="text-3xl font-display font-bold leading-none text-black dark:text-white">12</p><p className="text-[8px] text-gray-500 font-bold uppercase tracking-0.3em mt-1">{curT.days}</p></div>
          </div>
        </div>
        <div>
          <h4 className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">{curT.stats}</h4>
          <div className="grid gap-3">
            <div className="bg-brand-gray/30 p-5 rounded-xl flex justify-between items-center border border-white/5"><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">XP Total</span><span className="font-display font-bold text-lg">{user?.totalXp}</span></div>
            <div className="bg-brand-gray/30 p-5 rounded-xl flex justify-between items-center border border-white/5"><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Nivel</span><span className="font-display font-bold text-lg">{user?.level}</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-brand-lime/10 to-transparent border border-brand-lime/20 p-6 rounded-[2rem] text-center">
            <Award className="mx-auto text-brand-lime mb-3" size={32} />
            <p className="text-[10px] font-display font-bold uppercase tracking-widest">Maestro</p>
            <div className="mt-3 w-full bg-black h-1.5 rounded-full overflow-hidden">
               <div className="bg-brand-lime h-full w-[80%]" />
            </div>
            <p className="text-[7px] text-gray-500 mt-2 font-bold uppercase tracking-widest">PROGRESO NIVEL</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-black dark:text-white transition-colors duration-300 overflow-x-hidden font-sans">
      {view === 'LANDING' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
           <Logo className="w-48 h-48 lg:w-56 lg:h-56" />
           <div className="mt-12 max-w-4xl mx-auto px-4">
              <h1 className="text-4xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-6 leading-none">{curT.landingTitle}</h1>
              <p className="text-gray-500 text-base lg:text-lg max-w-xl mb-12 leading-relaxed mx-auto opacity-80">{curT.landingDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setView('LOGIN')} className="bg-brand-lime text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-[10px] shadow-xl hover:scale-105 transition-all">{curT.startNow}</button>
                <button onClick={handleGuestLogin} className="bg-white/5 text-gray-400 border border-white/10 px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-[10px] hover:text-white transition-all">{curT.accessAsGuest}</button>
              </div>
           </div>
        </div>
      )}

      {(view === 'LOGIN' || view === 'REGISTER') && (
        <div className="min-h-screen flex flex-col md:flex-row animate-in fade-in duration-700">
           <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-20 bg-black border-r border-white/5 relative">
             <Logo className="w-56 h-56 lg:w-72 lg:h-72 relative z-10" />
           </div>
           <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative">
             <button onClick={() => setView('LANDING')} className="absolute top-10 left-10 text-gray-400 font-bold uppercase tracking-widest text-[8px] flex items-center gap-2 hover:text-white transition-colors"><ChevronRight size={12} className="rotate-180" /> Volver</button>
             <div className="w-full max-w-xs animate-in slide-in-from-right-10">
                <h2 className="text-4xl lg:text-5xl font-display font-bold mb-8 tracking-tighter uppercase leading-none">{view === 'LOGIN' ? curT.login : curT.register}</h2>
                {errorMsg && <div className="text-red-500 text-[9px] font-bold mb-6 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center uppercase tracking-widest">{errorMsg}</div>}
                <form onSubmit={view === 'LOGIN' ? handleLogin : handleRegister} className="space-y-2.5">
                  {view === 'REGISTER' && (
                    <>
                      <input type="text" required placeholder={curT.name} value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                      <input type="text" required placeholder={curT.username} value={regUser} onChange={e => setRegUser(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                    </>
                  )}
                  <input type={view === 'LOGIN' ? "text" : "email"} required placeholder={view === 'LOGIN' ? curT.userOrEmail : curT.email} value={view === 'LOGIN' ? loginId : regEmail} onChange={e => view === 'LOGIN' ? setLoginId(e.target.value) : setRegEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                  <input type="password" required placeholder={curT.password} value={view === 'LOGIN' ? loginPass : regPass} onChange={e => view === 'LOGIN' ? setLoginPass(e.target.value) : setRegPass(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                  <button type="submit" className="w-full bg-brand-lime text-black py-5 rounded-xl font-bold uppercase tracking-widest mt-4 shadow-xl active:scale-95 transition-all text-[10px]">
                    {view === 'LOGIN' ? curT.login : 'Crear Cuenta'}
                  </button>
                </form>
                <div className="flex justify-center mt-8">
                  <button onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-gray-500 font-bold uppercase tracking-widest text-[8px] hover:text-white">{view === 'LOGIN' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Login'}</button>
                </div>
             </div>
           </div>
        </div>
      )}

      {user && view !== 'LANDING' && view !== 'LOGIN' && view !== 'REGISTER' && (
        <div className="flex flex-col md:flex-row min-h-screen">
           <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen fixed left-0 top-0 bg-white dark:bg-brand-gray border-r dark:border-white/5 p-8 z-50">
              <div className="mb-12 flex justify-center"><Logo className="w-20 h-20" showText={false} /></div>
              <nav className="flex-1 space-y-1">
                {[
                  { id: 'HOME', icon: Home, label: curT.home }, 
                  { id: 'DISCOVER', icon: Lightbulb, label: curT.discover },
                  { id: 'MOOD', icon: Smile, label: curT.mood },
                  { id: 'HISTORY', icon: CalendarIcon, label: curT.history },
                  { id: 'RANKING', icon: Trophy, label: curT.ranking }, 
                  { id: 'ADVISOR', icon: MessageSquare, label: curT.advisor }, 
                  { id: 'PROFILE', icon: UserIcon, label: curT.profile }
                ].map(item => (
                  <button key={item.id} onClick={() => setView(item.id as ViewState)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] transition-all ${view === item.id ? 'bg-brand-lime text-black shadow-lg shadow-brand-lime/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest text-[8px] p-2 transition-colors"><LogOut size={14} /> Salir</button>
           </aside>

           <main className={`flex-1 md:ml-60 lg:ml-64 ${view === 'HOME' ? 'xl:mr-72' : ''} p-8 lg:p-12 max-w-6xl mx-auto w-full pb-32`}>
             {view === 'SUBSCRIPTION_SETUP' && <PlanSelection curT={curT} onSelect={(p) => {
               if(user) { 
                 const updated = {...user, subscriptionPlan: p}; 
                 setUser(updated); 
                 storageService.saveUser(updated); 
                 setView(updated.onboardingCompleted ? 'PROFILE' : 'ONBOARDING'); 
               }
             }} />}

             {view === 'ONBOARDING' && <Onboarding user={user} curT={curT} onComplete={(suggested) => {
               const newHabits = suggested.map(s => ({ ...s, id: Math.random().toString(36).substr(2,9), completedDates:[], streak:0, xpReward: 20, color: 'bg-brand-lime', icon: 'Sparkles' }));
               const combined = [...habits, ...newHabits];
               setHabits(combined);
               if (user) {
                 const updated = {...user, onboardingCompleted: true};
                 setUser(updated); storageService.saveUser(updated); storageService.saveHabits(user.email, combined);
               }
               setView('HOME');
             }} />}

             {view === 'HOME' && (
               <div className="space-y-12 animate-in fade-in duration-700">
                 <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                   <div>
                     <p className="text-brand-lime font-bold uppercase tracking-[0.4em] text-[9px] mb-2">{curT.dailySummary}</p>
                     <h1 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter leading-none">{curT.greeting.replace('{name}', user.name.split(' ')[0])}</h1>
                   </div>
                   <div className="bg-brand-lime text-black px-6 py-2.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] flex items-center gap-3 shadow-xl">
                     <Zap size={16}/> LVL {user.level}
                   </div>
                 </header>

                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl relative border border-white/5">
                     <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-3">{curT.progress}</div>
                     <div className="text-7xl lg:text-8xl font-display font-bold tracking-tighter leading-none mb-6">{completedToday}<span className="text-gray-300 text-3xl ml-1">/{habits.length}</span></div>
                     <div className="w-full bg-gray-100 dark:bg-black rounded-full h-2 overflow-hidden"><div className="bg-brand-lime h-full rounded-full transition-all duration-1000" style={{ width: `${(completedToday / (habits.length || 1)) * 100}%` }}></div></div>
                   </div>
                   <div className="bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl border border-white/5">
                     <StatsChart />
                   </div>
                 </div>

                 {motivation && <div className="bg-gradient-to-r from-brand-lime/10 to-transparent border-l-4 border-brand-lime rounded-r-2xl p-6 lg:p-8 text-lg lg:text-2xl font-display font-bold leading-tight italic">"{motivation}"</div>}

                 <section className="space-y-8">
                   <div className="flex justify-between items-end">
                     <h2 className="text-2xl lg:text-3xl font-display font-bold uppercase tracking-tighter leading-none">{curT.yourHabits}</h2>
                     <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-lime text-black px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Plus size={14}/> {curT.add}</button>
                   </div>
                   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {habits.map(habit => {
                       const done = habit.completedDates.includes(new Date().toISOString().split('T')[0]);
                       return (
                         <div key={habit.id} onClick={() => toggleHabit(habit.id)} className="bg-white dark:bg-brand-gray border dark:border-white/5 p-6 rounded-[2rem] shadow-xl cursor-pointer group hover:-translate-y-1 transition-all">
                           <div className="flex justify-between items-start mb-6">
                             <div className={`w-12 h-12 rounded-xl ${habit.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}><Zap size={24} /></div>
                             <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${done ? 'bg-brand-lime border-brand-lime text-black' : 'border-gray-100 dark:border-white/10 text-gray-300'}`}><Check size={28} strokeWidth={3} /></div>
                           </div>
                           <h3 className={`text-lg lg:text-xl font-display font-bold uppercase tracking-tight mb-1 ${done ? 'line-through opacity-20' : ''}`}>{habit.title}</h3>
                           <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Flame size={12} className="text-orange-500" /> {habit.streak} {curT.days}</p>
                         </div>
                       );
                     })}
                   </div>
                 </section>
               </div>
             )}

             {view === 'DISCOVER' && (
               <AIDiscoverView 
                 user={user} habits={habits} curT={curT} 
                 onAddHabit={(opt) => {
                   if (user.subscriptionPlan === 'free' && habits.length >= 5) { setErrorMsg(curT.errLimitReached); return; }
                   if (habits.some(h => h.title.toLowerCase() === opt.title.toLowerCase())) { setErrorMsg(curT.errDuplicateHabit); return; }
                   const newH: Habit = { ...opt, id: Math.random().toString(36).substr(2,9), completedDates:[], streak:0, xpReward: opt.xp, icon: 'Zap', color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)], frequencyType: 'daily' };
                   const updated = [...habits, newH]; setHabits(updated); storageService.saveHabits(user.email, updated);
                   setSuccessMsg("¡Añadido!"); setTimeout(() => setSuccessMsg(null), 3000);
                 }} 
               />
             )}

             {view === 'MOOD' && <MoodTrackerView user={user} curT={curT} onSaveMood={handleSaveMood} />}
             {view === 'HISTORY' && <History user={user} habits={habits} curT={curT} />}
             
             {view === 'RANKING' && (
               <div className="animate-in slide-in-from-bottom duration-700 max-w-4xl mx-auto">
                  <h1 className="text-6xl lg:text-8xl font-display font-bold uppercase tracking-tighter mb-12 leading-none">{curT.ranking}</h1>
                  <div className="space-y-3">
                    {allUsers.sort((a,b) => b.totalXp - a.totalXp).map((u, i) => (
                      <div key={u.email} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all gap-6 ${u.email === user.email ? 'border-brand-lime bg-brand-lime/10 shadow-lg' : 'border-transparent bg-white dark:bg-brand-gray'}`}>
                        <div className="flex items-center gap-6">
                          <span className={`text-3xl font-display font-bold ${i < 3 ? 'text-brand-lime' : 'text-gray-400 opacity-20'}`}>{i + 1}</span>
                          <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-gray-500 border border-white/5 overflow-hidden shadow-inner">
                            {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover"/> : <UserIcon size={20} />}
                          </div>
                          <div>
                            <p className="text-xl lg:text-2xl font-display font-bold uppercase leading-none mb-1">{u.name}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{u.totalXp} XP • LVL {u.level}</p>
                          </div>
                        </div>
                        {i === 0 && <Award className="text-brand-lime" size={24} />}
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {view === 'ADVISOR' && <AIChat user={user} curT={curT} />}

             {view === 'PROFILE' && (
               <div className="max-w-3xl mx-auto space-y-12 animate-in zoom-in duration-700 pb-20">
                 <header className="text-center space-y-8">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-40 h-40 lg:w-48 lg:h-48 bg-brand-lime rounded-[3.5rem] lg:rounded-[4rem] mx-auto flex items-center justify-center text-7xl text-black font-display font-bold shadow-2xl relative group border-[8px] border-black overflow-hidden cursor-pointer"
                   >
                     {profileImg ? <img src={profileImg} className="w-full h-full object-cover transition-transform group-hover:scale-110"/> : user.name[0]}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={32} className="text-white" />
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter leading-none">{user.name}</h2>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl space-y-8 border border-white/5">
                     <div className="flex items-center gap-4"><Edit3 className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">Mis Datos</h4></div>
                     <div className="space-y-4">
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre" className="w-full bg-gray-100 dark:bg-black/30 border border-black/5 dark:border-white/5 p-4 rounded-xl outline-none text-base font-display uppercase tracking-tight text-black dark:text-white" />
                        <input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Usuario" className="w-full bg-gray-100 dark:bg-black/30 border border-black/5 dark:border-white/5 p-4 rounded-xl outline-none text-base font-display uppercase tracking-tight text-black dark:text-white" />
                        <button onClick={handleUpdateProfile} className="w-full bg-brand-lime text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg hover:scale-[1.02] transition-all"><Save size={14} /> {curT.saveChanges}</button>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl space-y-8 border border-white/5">
                     <div className="flex items-center gap-4"><Settings className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">Sistema</h4></div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center bg-black/30 p-6 rounded-xl">
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{curT.language}</span>
                           <div className="flex gap-2">
                              <button onClick={() => changeLanguage('es')} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold ${user.language === 'es' ? 'bg-brand-lime text-black' : 'text-gray-500'}`}>ES</button>
                              <button onClick={() => changeLanguage('en')} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold ${user.language === 'en' ? 'bg-brand-lime text-black' : 'text-gray-500'}`}>EN</button>
                           </div>
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-6 rounded-xl">
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{curT.darkMode}</span>
                           <button 
                             onClick={toggleDarkMode}
                             className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-brand-lime' : 'bg-gray-700'}`}
                           >
                             <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isDarkMode ? 'right-1 bg-black' : 'left-1 bg-white'} flex items-center justify-center`}>
                               {isDarkMode ? <Moon size={8} /> : <SunIcon size={8} />}
                             </div>
                           </button>
                        </div>
                     </div>
                     <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Salir</button>
                   </div>

                   <div className="md:col-span-2 bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl space-y-8 border border-white/5">
                     <div className="flex items-center gap-4"><Award className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">Suscripción</h4></div>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-black/30 p-8 rounded-3xl">
                       <div className="text-center md:text-left">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{curT.currentPlan}</p>
                         <p className="text-3xl font-display font-bold uppercase text-brand-lime">{user.subscriptionPlan}</p>
                       </div>
                       <button 
                         onClick={() => setView('SUBSCRIPTION_SETUP')}
                         className="bg-brand-lime text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
                       >
                         {curT.changePlan}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </main>
           
           {view === 'HOME' && <RightSidebar />}

           <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/95 dark:bg-brand-black/95 backdrop-blur-3xl px-8 py-4 flex justify-between items-center z-[90] rounded-[2rem] shadow-2xl border border-white/10">
              {[
                { id: 'HOME', icon: Home }, { id: 'DISCOVER', icon: Lightbulb }, { id: 'MOOD', icon: Smile },
                { id: 'RANKING', icon: Trophy }, { id: 'PROFILE', icon: UserIcon }
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id as any)} className={`transition-all ${view === item.id ? 'text-brand-lime scale-125' : 'text-gray-400 opacity-40'}`}>
                  <item.icon size={20} />
                </button>
              ))}
           </nav>
        </div>
      )}

      <AddHabitModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={h => {
        if (habits.some(ex => ex.title.toLowerCase() === h.title.toLowerCase())) {
          setErrorMsg(curT.errDuplicateHabit); setTimeout(() => setErrorMsg(null), 5000); return;
        }
        const newH = {...h, id: Math.random().toString(36).substr(2,9), completedDates:[], streak:0};
        const updated = [...habits, newH]; setHabits(updated);
        if (user) storageService.saveHabits(user.email, updated);
      }} habitCount={habits.length} user={user!} />

      {errorMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[8px] shadow-2xl animate-in slide-in-from-top duration-500">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-brand-lime text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[8px] shadow-2xl animate-in slide-in-from-top duration-500">
          {successMsg}
        </div>
      )}
    </div>
  );
};

const AddHabitModal = ({ isOpen, onClose, onSave, habitCount, user }: { isOpen: boolean, onClose: () => void, onSave: (h: any) => void, habitCount: number, user: User }) => {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false); const [error, setError] = useState<string | null>(null);
  const curT = translations[user?.language || 'es'];
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (user.subscriptionPlan === 'free' && habitCount >= 5) { setError(curT.errLimitReached); return; }
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeHabitDifficulty(title, description, user.language);
      onSave({ title, description, difficulty: analysis.difficulty, xpReward: analysis.xp, icon: 'Zap', color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)], frequencyType: 'daily' });
      setTitle(''); setDescription(''); onClose();
    } catch (err) { setError("Fallo de conexión"); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-brand-gray w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-white/10 relative">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-display font-bold uppercase tracking-tighter text-black dark:text-white leading-none">{curT.newHabit}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Nombre" className="w-full px-5 py-4 rounded-xl border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white outline-none text-xs font-display uppercase tracking-tight" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="¿Por qué?" className="w-full px-5 py-4 rounded-xl border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white min-h-[100px] outline-none text-xs" />
          {error && <div className="text-red-500 text-[8px] font-bold text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20 uppercase tracking-widest">{error}</div>}
          <button type="submit" disabled={isAnalyzing} className="w-full bg-brand-lime text-black py-5 rounded-xl font-bold uppercase tracking-[0.3em] shadow-xl text-[10px]">
            {isAnalyzing ? <div className="flex items-center justify-center gap-3"><Zap className="animate-spin" size={14} /> {curT.analyzing}</div> : curT.createHabit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
