
import React, { useState, useEffect, useRef } from 'react';
import {
  Home, User as UserIcon, Check, X, Sparkles, LogOut, Moon, Sun as SunIcon,
  Award, Flame, ChevronRight, Trophy, Clock, MessageSquare, Zap, Plus, TrendingUp, UserCheck, Calendar as CalendarIcon, Languages, Settings, Target, ArrowRight,
  Camera, ShieldCheck, Lock
} from 'lucide-react';
import { Logo } from './components/Logo';
import { StatsChart } from './components/StatsChart';
import { HABIT_COLORS, Habit, User, ViewState, Language } from './types';
import { analyzeHabitDifficulty, getMotivationalQuote, getAIAdvice, generateSuggestedHabits } from './services/geminiService';
import { storageService } from './services/storageService';

const translations = {
  es: {
    login: "Entrar", register: "Regístrate", email: "Email", userOrEmail: "Email o Usuario",
    password: "Contraseña", username: "Nombre de Usuario", name: "Nombre Completo", noAccount: "¿No tienes cuenta?",
    home: "Inicio", ranking: "Ranking", advisor: "Mentor IA", profile: "Perfil", history: "Historial",
    greeting: "¡A tope, {name}!", yourHabits: "Tus Hábitos", days: "días", add: "Añadir",
    newHabit: "Nuevo Hábito", createHabit: "Crear Hábito", analyzing: "Analizando...",
    errWrongPass: "Credenciales incorrectas", errPassShort: "Mínimo 6 caracteres", errUserTaken: "Usuario o Email ya registrado",
    errLimitReached: "Has alcanzado el límite de 5 hábitos del plan gratuito. ¡Mejora tu plan para añadir más!",
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
    getStarted: "Empezar", upgrade: "Mejorar"
  },
  en: {
    login: "Login", register: "Register", email: "Email", userOrEmail: "Email or Username",
    password: "Password", username: "Username", name: "Full Name", noAccount: "Don't have an account?",
    home: "Home", ranking: "Ranking", advisor: "AI Mentor", profile: "Profile", history: "History",
    greeting: "Let's go, {name}!", yourHabits: "Your Habits", days: "days", add: "Add",
    newHabit: "New Habit", createHabit: "Create Habit", analyzing: "Analyzing...",
    errWrongPass: "Incorrect credentials", errPassShort: "Min 6 characters", errUserTaken: "User/Email already exists",
    errLimitReached: "You've reached the 5-habit limit of the free plan. Upgrade to add more!",
    dailySummary: "Daily Summary", progress: "Progress",
    startNow: "Start Now", landingTitle: "Transform your life, habit by habit.", landingDesc: "The ultimate app to gamify your personal growth with AI.",
    loginWithGoogle: "Login with Google", accessAsGuest: "Guest Access",
    onboardingTitle: "Setup Your Flow", onboardingDesc: "Answer these brief questions so our AI can design your ideal path.",
    goalLabel: "What is your main goal?", energyLabel: "When do you have the most energy?",
    intensityLabel: "How much intensity are you looking for?",
    generateSuggestions: "Generate Suggestions", accept: "Accept", decline: "Decline",
    activeStreak: "Active Streak", rewards: "Rewards", language: "Language", darkMode: "Dark Mode",
    stats: "Statistics", totalXp: "Total XP", level: "Level", habitsCompleted: "Completed",
    jan: "Jan", feb: "Feb", mar: "Mar", apr: "Abr", may: "May", jun: "Jun", jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
    selectPlan: "Select Your Plan", freeDesc: "Perfect to start", proDesc: "For the committed", premiumDesc: "Max performance with AI",
    limit5: "5 habits limit", unlimited: "Unlimited habits", friendsRanking: "Friends ranking", aiAccess: "Gemini AI Mentor access",
    getStarted: "Get Started", upgrade: "Upgrade"
  }
};

const PlanSelection = ({ onSelect, curT }: { onSelect: (plan: 'free' | 'basic' | 'premium') => void, curT: any }) => {
  const plans = [
    { id: 'free', title: 'Free', price: '0€', desc: curT.freeDesc, icon: Zap, features: [curT.limit5], color: 'text-gray-400' },
    { id: 'basic', title: 'Pro', price: '4.99€', desc: curT.proDesc, icon: ShieldCheck, features: [curT.unlimited, curT.friendsRanking], color: 'text-brand-lime' },
    { id: 'premium', title: 'Elite', price: '9.99€', desc: curT.premiumDesc, icon: Sparkles, features: [curT.unlimited, curT.friendsRanking, curT.aiAccess], color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 animate-in fade-in zoom-in duration-700">
      <h2 className="text-7xl font-display font-bold text-center uppercase tracking-tighter mb-4">{curT.selectPlan}</h2>
      <p className="text-center text-gray-500 font-bold uppercase tracking-[0.4em] mb-20 text-[10px]">COMIENZA TU TRANSFORMACIÓN</p>
      <div className="grid lg:grid-cols-3 gap-10">
        {plans.map((p) => (
          <div key={p.id} className="bg-white dark:bg-brand-gray/30 p-12 rounded-[4rem] border-2 border-transparent hover:border-brand-lime transition-all flex flex-col h-full group shadow-2xl">
            <div className={`w-16 h-16 rounded-3xl bg-black flex items-center justify-center mb-8 ${p.color}`}><p.icon size={32} /></div>
            <h3 className="text-4xl font-display font-bold uppercase mb-2">{p.title}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">{p.desc}</p>
            <div className="mb-10">
              <span className="text-6xl font-display font-bold">{p.price}</span>
              <span className="text-xs text-gray-500 ml-2">/ MES</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-400"><Check size={16} className="text-brand-lime" /> {f}</li>
              ))}
            </ul>
            <button onClick={() => onSelect(p.id as any)} className="w-full bg-brand-lime text-black py-6 rounded-3xl font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl">{curT.getStarted}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AIChat = ({ user, curT }: { user: User, curT: any }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (user.subscriptionPlan !== 'premium') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white dark:bg-brand-gray rounded-[4rem] border-2 border-dashed dark:border-white/10 p-20 text-center space-y-8">
        <div className="w-24 h-24 rounded-[2rem] bg-purple-500/10 flex items-center justify-center text-purple-500"><Lock size={48} /></div>
        <div>
          <h3 className="text-4xl font-display font-bold uppercase mb-4">Acceso Elite Requerido</h3>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed uppercase text-[10px] font-bold tracking-widest">El Mentor IA Gemini solo está disponible para usuarios con el plan Elite.</p>
        </div>
        <button className="bg-purple-500 text-white px-12 py-5 rounded-3xl font-bold uppercase tracking-[0.3em] text-xs shadow-xl hover:scale-105 transition-all">Mejorar Plan Ahora</button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input; setInput(''); setMessages(prev => [...prev, { role: 'user', text: userMsg }]); setIsTyping(true);
    const response = await getAIAdvice(userMsg, [], user.language); setMessages(prev => [...prev, { role: 'model', text: response }]); setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white dark:bg-brand-gray rounded-[3rem] border dark:border-white/5 shadow-2xl overflow-hidden">
      <div className="p-8 border-b dark:border-white/5 bg-brand-lime/10 flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-brand-lime flex items-center justify-center text-black"><Sparkles size={24} /></div>
        <div><h3 className="font-display font-bold uppercase text-lg">AI Flow Mentor (ELITE)</h3></div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-gray-100 dark:bg-black text-black dark:text-white rounded-tl-none border dark:border-white/5'}`}>{m.text}</div>
          </div>
        ))}
        {isTyping && <div className="flex gap-2 p-4 animate-pulse"><Zap size={16} className="text-brand-lime" /> {curT.analyzing}</div>}
        <div ref={endRef} />
      </div>
      <div className="p-8 flex gap-4">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Escribe tu duda..." className="flex-1 bg-gray-50 dark:bg-black p-6 rounded-2xl outline-none border border-transparent focus:border-brand-lime/30 transition-all" />
        <button onClick={handleSend} className="bg-brand-lime text-black p-6 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"><Plus /></button>
      </div>
    </div>
  );
};

// Moved OptionButton outside to satisfy TS requirements for React components in maps
interface OptionButtonProps {
  label: string;
  value: string;
  current: string;
  onClick: (v: string) => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, value, current, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`w-full p-8 rounded-[2rem] border-2 text-left flex justify-between items-center group transition-all duration-300 ${current === value ? 'border-brand-lime bg-brand-lime/10 shadow-[0_10px_30px_rgba(211,255,153,0.1)]' : 'border-white/5 bg-brand-gray/30 text-gray-500 hover:border-white/10'}`}
  >
    <span className={`text-xl font-display font-bold uppercase tracking-tight ${current === value ? 'text-brand-lime' : 'group-hover:text-white'}`}>{label}</span>
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${current === value ? 'border-brand-lime bg-brand-lime text-black' : 'border-white/10 group-hover:border-white/30'}`}>
      {current === value && <Check size={16} strokeWidth={4} />}
    </div>
  </button>
);

const Onboarding = ({ user, onComplete, onAnswersSubmit, curT }: { user: User, onComplete: (habits: any[]) => void, onAnswersSubmit?: (answers: { goal: string; energy: string; intensity: string }) => void, curT: any }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goal: '', energy: '', intensity: '' });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFinishQuestions = async () => {
    onAnswersSubmit?.(answers);
    setLoading(true);
    const suggested = await generateSuggestedHabits(answers, user.language);
    setSuggestions(suggested);
    setStep(1);
    setLoading(false);
  };

  if (step === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 animate-in fade-in zoom-in duration-700">
        <Logo className="w-32 h-32 mx-auto mb-10" showText={false} />
        <h2 className="text-6xl md:text-8xl font-display font-bold text-center uppercase tracking-tighter mb-4 leading-none">{curT.onboardingTitle}</h2>
        <p className="text-gray-500 text-center mb-16 uppercase text-[10px] font-bold tracking-[0.5em]">{curT.onboardingDesc}</p>

        <div className="space-y-12">
          <div className="space-y-6">
            <label className="text-xs font-bold uppercase tracking-[0.3em] text-brand-lime/60 ml-2">{curT.goalLabel}</label>
            <div className="flex flex-col gap-4">
              {['Salud Física', 'Productividad Radical', 'Equilibrio Mental', 'Disciplina Maestra'].map(g => (
                <OptionButton key={g} label={g} value={g} current={answers.goal} onClick={(v) => setAnswers({ ...answers, goal: v })} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-bold uppercase tracking-[0.3em] text-brand-lime/60 ml-2">{curT.energyLabel}</label>
            <div className="flex flex-col gap-4">
              {['Amanecer (05:00 - 09:00)', 'Foco Diario (09:00 - 18:00)', 'Quietud Nocturna (18:00+)'].map(e => (
                <OptionButton key={e} label={e} value={e} current={answers.energy} onClick={(v) => setAnswers({ ...answers, energy: v })} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-bold uppercase tracking-[0.3em] text-brand-lime/60 ml-2">{curT.intensityLabel}</label>
            <div className="flex flex-col gap-4">
              {['Ritmo Sostenible (15 min/día)', 'Modo Bestia (45 min/día)', 'Evolución Total (90 min/día)'].map(i => (
                <OptionButton key={i} label={i} value={i} current={answers.intensity} onClick={(v) => setAnswers({ ...answers, intensity: v })} />
              ))}
            </div>
          </div>

          <button
            disabled={!answers.goal || !answers.energy || !answers.intensity || loading}
            onClick={handleFinishQuestions}
            className="w-full bg-brand-lime text-black py-8 rounded-[2.5rem] font-bold uppercase tracking-[0.5em] mt-10 shadow-2xl disabled:opacity-30 active:scale-95 transition-all transform hover:shadow-brand-lime/20"
          >
            {loading ? <div className="flex items-center justify-center gap-4"><Zap className="animate-spin" /> {curT.analyzing}</div> : curT.generateSuggestions}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 animate-in slide-in-from-right duration-700">
      <h2 className="text-6xl font-display font-bold uppercase tracking-tighter mb-4 text-center">Protocolo de Hábitos</h2>
      <p className="text-gray-500 text-center mb-16 uppercase text-[10px] font-bold tracking-widest">PROPUESTAS PERSONALIZADAS POR IA</p>
      <div className="grid gap-6">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-brand-gray/30 p-10 rounded-[4rem] border border-white/5 flex flex-col md:flex-row items-center justify-between group hover:border-brand-lime/40 transition-all gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                <span className="px-4 py-1 bg-black text-brand-lime text-[10px] font-bold uppercase rounded-full border border-brand-lime/20">{s.difficulty}</span>
                <span className="px-4 py-1 bg-black text-purple-400 text-[10px] font-bold uppercase rounded-full border border-purple-500/20">IA GEN</span>
              </div>
              <h3 className="text-3xl font-display font-bold uppercase text-white mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => {
                const newHabitsList = suggestions.filter((_, idx) => idx !== i);
                setSuggestions(newHabitsList);
                onComplete([s]);
              }} className="bg-brand-lime text-black w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all"><Plus size={32} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-20 flex justify-center">
        <button onClick={() => onComplete([])} className="px-12 py-5 bg-white/5 border border-white/10 rounded-3xl text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all">Empezar con mis propios hábitos</button>
      </div>
    </div>
  );
};

const History = ({ habits, curT }: { habits: Habit[], curT: any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = [curT.jan, curT.feb, curT.mar, curT.apr, curT.may, curT.jun, curT.jul, curT.aug, curT.sep, curT.oct, curT.nov, curT.dec];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
        <h1 className="text-7xl md:text-9xl font-display font-bold uppercase tracking-tighter leading-none">{curT.history}</h1>
        <div className="flex items-center gap-6 bg-brand-gray/30 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:text-brand-lime transition-colors"><ChevronRight className="rotate-180" /></button>
          <span className="font-display font-bold uppercase tracking-[0.2em] text-xl min-w-[140px] text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:text-brand-lime transition-colors"><ChevronRight /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={i}></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
          const total = habits.length;
          const pct = total > 0 ? (completed / total) : 0;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div key={i} className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center border transition-all relative overflow-hidden group ${isToday ? 'ring-2 ring-brand-lime ring-offset-4 ring-offset-black' : ''} ${pct === 1 ? 'bg-brand-lime text-black' : pct > 0.5 ? 'bg-brand-lime/40 border-brand-lime/60' : pct > 0 ? 'bg-brand-lime/10 border-brand-lime/20' : 'bg-brand-gray/20 border-white/5 text-gray-700'}`}>
              <span className="text-2xl font-display font-bold z-10">{i + 1}</span>
              {total > 0 && <span className="text-[8px] font-bold uppercase mt-1 opacity-60 z-10">{completed}/{total}</span>}
            </div>
          );
        })}
      </div>
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

  // Form states
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const curT = user ? (translations[user.language] || translations.es) : translations.es;

  useEffect(() => {
    const initSession = async () => {
      const sessionUser = await storageService.getCurrentSessionUser();
      if (sessionUser) {
        setUser(sessionUser);
        const userHabits = await storageService.loadHabits(sessionUser.email);
        setHabits(userHabits);
        if (!sessionUser.subscriptionPlan) setView('SUBSCRIPTION_SETUP');
        else if (!sessionUser.onboardingCompleted) setView('ONBOARDING');
        else setView('HOME');
        setIsDarkMode(sessionUser.darkMode);
      }
      const users = await storageService.getAllUsers();
      setAllUsers(users);
    };
    initSession();
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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = await storageService.authenticate(loginId, loginPass);
    if (u) {
      setUser(u);
      const userHabits = await storageService.loadHabits(u.email);
      setHabits(userHabits);
      if (!u.subscriptionPlan) setView('SUBSCRIPTION_SETUP');
      else if (!u.onboardingCompleted) setView('ONBOARDING');
      else setView('HOME');
      setIsDarkMode(u.darkMode); setErrorMsg(null);
    } else { setErrorMsg(curT.errWrongPass); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); if (regPass.length < 6) { setErrorMsg(curT.errPassShort); return; }

    // Check if user exists first
    const existingUser = await storageService.findUser(regEmail) || await storageService.findUser(regUser);
    if (existingUser) { setErrorMsg(curT.errUserTaken); return; }

    const newUser: Partial<User> = { name: regName, username: regUser, email: regEmail, password: regPass, level: 1, currentXp: 0, nextLevelXp: 1000, totalXp: 0, darkMode: true, language: 'es', subscriptionPlan: 'free', onboardingCompleted: false };

    try {
      const createdUser = await storageService.register(newUser);
      if (createdUser) {
        setUser(createdUser as User); setHabits([]); setView('SUBSCRIPTION_SETUP'); setErrorMsg(null);
      }
    } catch (err) {
      setErrorMsg("Error al registrar usuario.");
    }
  };

  const handleLogout = () => { storageService.logout(); setUser(null); setHabits([]); setView('LANDING'); };

  const handleGuestLogin = async () => {
    // Guest login strategy needs to be adapted for backend or kept local-only
    // For now we will create a transient user in backend
    const guestUser: Partial<User> = {
      name: 'Invitado',
      username: 'guest' + Math.floor(Math.random() * 10000),
      email: `guest_${Date.now()}@temp.com`,
      password: 'guestpassword', // Dummy password
      level: 1, currentXp: 0, nextLevelXp: 1000, totalXp: 0, darkMode: true, language: 'es', subscriptionPlan: 'free', onboardingCompleted: false,
      isGuest: true
    };
    try {
      const createdUser = await storageService.register(guestUser);
      if (createdUser) {
        setUser(createdUser as User); setHabits([]); setView('SUBSCRIPTION_SETUP'); setErrorMsg(null);
      }
    } catch (e) {
      setErrorMsg("Error al entrar como invitado");
    }
  };

  const toggleHabit = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedHabits: Habit[] = [];

    setHabits(prev => {
      updatedHabits = prev.map(h => {
        if (h.id === id) {
          const done = h.completedDates.includes(today);
          return { ...h, completedDates: done ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today], streak: done ? Math.max(0, h.streak - 1) : h.streak + 1 };
        }
        return h;
      });
      return updatedHabits;
    });

    if (user && updatedHabits.length > 0) {
      await storageService.saveHabits(user.email, updatedHabits);
    }
  };

  const changeLanguage = (l: Language) => {
    if (user) {
      const updated = { ...user, language: l };
      setUser(updated);
      storageService.saveUser(updated);
    }
  };

  const toggleDarkMode = () => {
    const nextDarkMode = !isDarkMode;
    setIsDarkMode(nextDarkMode);
    if (user) {
      const updated = { ...user, darkMode: nextDarkMode };
      setUser(updated);
      storageService.saveUser(updated);
    }
  };

  const completedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;

  const RightSidebar = () => (
    <div className="hidden xl:flex flex-col w-96 h-screen fixed right-0 top-0 bg-white dark:bg-brand-gray border-l dark:border-white/5 p-12 overflow-y-auto z-40">
      <div className="space-y-12">
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6">{curT.activeStreak}</h4>
          <div className="bg-black p-10 rounded-[3rem] flex items-center gap-6 border border-white/5">
            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]"><Flame size={32} /></div>
            <div><p className="text-5xl font-display font-bold leading-none">12</p><p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">{curT.days}</p></div>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6">{curT.stats}</h4>
          <div className="grid gap-4">
            <div className="bg-brand-gray/30 p-8 rounded-3xl flex justify-between items-center border border-white/5 shadow-lg"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">XP Total</span><span className="font-display font-bold text-2xl">{user?.totalXp}</span></div>
            <div className="bg-brand-gray/30 p-8 rounded-3xl flex justify-between items-center border border-white/5 shadow-lg"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nivel</span><span className="font-display font-bold text-2xl">{user?.level}</span></div>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6">{curT.rewards}</h4>
          <div className="bg-gradient-to-br from-brand-lime/10 to-transparent border border-brand-lime/20 p-10 rounded-[3.5rem] text-center shadow-xl">
            <Award className="mx-auto text-brand-lime mb-6 drop-shadow-[0_0_10px_#D3FF99]" size={56} />
            <p className="text-sm font-display font-bold uppercase tracking-widest">Maestro del Flujo</p>
            <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-widest">A 500 XP DE NIVEL 13</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-black dark:text-white transition-colors duration-300 overflow-x-hidden">
      {view === 'LANDING' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
          <Logo className="w-64 h-64 md:w-80 md:h-80" />
          <div className="mt-16 md:mt-24 max-w-6xl mx-auto px-4">
            <h1 className="text-5xl md:text-9xl font-display font-bold uppercase tracking-tighter mb-10 leading-[0.8]">{curT.landingTitle}</h1>
            <p className="text-gray-500 text-lg md:text-2xl max-w-3xl mb-20 leading-relaxed mx-auto opacity-80">{curT.landingDesc}</p>
            <button onClick={() => setView('LOGIN')} className="bg-brand-lime text-black px-16 py-8 rounded-[3rem] font-bold uppercase tracking-[0.5em] text-sm shadow-2xl hover:scale-110 active:scale-95 transition-all transform">{curT.startNow}</button>
          </div>
        </div>
      )}

      {(view === 'LOGIN' || view === 'REGISTER') && (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-brand-black animate-in fade-in duration-700">
          <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-20 bg-black border-r border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-brand-lime/10 to-transparent opacity-30"></div>
            <Logo className="w-80 h-80 relative z-10" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 relative overflow-y-auto">
            <button onClick={() => { setView('LANDING'); setErrorMsg(null); }} className="absolute top-10 left-10 text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"><ChevronRight size={16} className="rotate-180" /> Volver</button>
            <div className="w-full max-w-md animate-in slide-in-from-right-10 duration-1000">
              <div className="md:hidden mb-12 flex justify-center"><Logo className="w-40 h-40" /></div>
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-12 tracking-tighter uppercase leading-none">{view === 'LOGIN' ? curT.login : curT.register}</h2>
              {errorMsg && <div className="text-red-500 text-xs font-bold mb-8 bg-red-500/10 p-6 rounded-3xl border border-red-500/20 text-center animate-in shake duration-500">{errorMsg}</div>}
              <form onSubmit={view === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
                {view === 'REGISTER' && (
                  <>
                    <input type="text" required placeholder={curT.name} value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-[2.2rem] p-7 text-black dark:text-white outline-none focus:ring-1 focus:ring-brand-lime transition-all" />
                    <input type="text" required placeholder={curT.username} value={regUser} onChange={e => setRegUser(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-[2.2rem] p-7 text-black dark:text-white outline-none focus:ring-1 focus:ring-brand-lime transition-all" />
                  </>
                )}
                <input type={view === 'LOGIN' ? "text" : "email"} required placeholder={view === 'LOGIN' ? curT.userOrEmail : curT.email} value={view === 'LOGIN' ? loginId : regEmail} onChange={e => view === 'LOGIN' ? setLoginId(e.target.value) : setRegEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-[2.2rem] p-7 text-black dark:text-white outline-none" />
                <input type="password" required placeholder={curT.password} value={view === 'LOGIN' ? loginPass : regPass} onChange={e => view === 'LOGIN' ? setLoginPass(e.target.value) : setRegPass(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-[2.2rem] p-7 text-black dark:text-white outline-none" />
                <button type="submit" className="w-full bg-brand-lime text-black py-8 rounded-[2.2rem] font-bold uppercase tracking-widest mt-8 shadow-2xl active:scale-95 transition-all transform hover:shadow-brand-lime/20">
                  {view === 'LOGIN' ? curT.login : 'Crear Cuenta'}
                </button>
              </form>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button onClick={handleGuestLogin} className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-brand-gray/30 text-gray-500 py-6 rounded-3xl border dark:border-white/5 font-bold uppercase tracking-widest text-[10px] hover:text-brand-lime transition-colors">{curT.accessAsGuest}</button>
                <button onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setErrorMsg(null); }} className="bg-black text-white dark:bg-white dark:text-black py-6 rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:opacity-80 transition-all">{view === 'LOGIN' ? 'Registrarse' : 'Login'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && view !== 'LANDING' && view !== 'LOGIN' && view !== 'REGISTER' && (
        <div className="flex flex-col md:flex-row min-h-screen">
          <aside className="hidden md:flex flex-col w-80 h-screen fixed left-0 top-0 bg-white dark:bg-brand-gray border-r dark:border-white/5 p-12 z-50 shadow-2xl">
            <div className="mb-20 flex justify-center"><Logo className="w-40 h-40" /></div>
            <nav className="flex-1 space-y-4">
              {[
                { id: 'HOME', icon: Home, label: curT.home },
                { id: 'HISTORY', icon: CalendarIcon, label: curT.history },
                { id: 'RANKING', icon: Trophy, label: curT.ranking },
                { id: 'ADVISOR', icon: MessageSquare, label: curT.advisor },
                { id: 'PROFILE', icon: UserIcon, label: curT.profile }
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id as ViewState)} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-[10px] transition-all ${view === item.id ? 'bg-brand-lime text-black shadow-xl' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button onClick={handleLogout} className="mt-auto flex items-center gap-4 text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest text-[10px] p-4 transition-colors"><LogOut size={20} /> Salir</button>
          </aside>

          <main className={`flex-1 md:ml-80 ${view === 'HOME' ? 'xl:mr-96' : ''} p-8 md:p-20 max-w-7xl mx-auto w-full pb-44`}>
            {view === 'SUBSCRIPTION_SETUP' && <PlanSelection curT={curT} onSelect={(p) => {
              if (user) { const updated = { ...user, subscriptionPlan: p }; setUser(updated); storageService.saveUser(updated); setView('ONBOARDING'); }
            }} />}

            {view === 'ONBOARDING' && <Onboarding user={user} curT={curT} onAnswersSubmit={(answers) => {
              if (user) {
                const updated = { ...user, onboardingAnswers: answers };
                setUser(updated);
                storageService.saveUser(updated);
              }
            }} onComplete={(suggested) => {
              const newHabits = suggested.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9), completedDates: [], streak: 0, xpReward: 20, color: 'bg-brand-lime', icon: 'Sparkles' }));
              setHabits(newHabits);
              if (user) {
                const updated = { ...user, onboardingCompleted: true };
                setUser(updated);
                storageService.saveUser(updated);
                storageService.saveHabits(user.email, newHabits);
              }
              setView('HOME');
            }} />}

            {view === 'HOME' && (
              <div className="space-y-16 animate-in fade-in duration-700">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                  <div>
                    <p className="text-brand-limeDark font-bold uppercase tracking-[0.5em] text-[11px] mb-4">{curT.dailySummary}</p>
                    <h1 className="text-6xl md:text-9xl font-display font-bold uppercase tracking-tighter leading-[0.85]">{curT.greeting.replace('{name}', user.name.split(' ')[0])}</h1>
                  </div>
                  <div className="bg-brand-lime text-black px-8 py-4 rounded-3xl font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-4 shadow-xl shadow-brand-lime/10">
                    <Zap size={20} /> LVL {user.level}
                  </div>
                </header>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="bg-white dark:bg-brand-gray p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
                    <TrendingUp className="absolute top-[-20%] right-[-10%] p-10 opacity-5 group-hover:opacity-10 transition-opacity" size={280} />
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.4em] mb-4">{curT.progress}</div>
                    <div className="text-9xl font-display font-bold tracking-tighter leading-none mb-8">{completedToday}<span className="text-gray-300 text-5xl ml-2">/{habits.length}</span></div>
                    <div className="w-full bg-gray-100 dark:bg-black rounded-full h-6 p-1 border border-white/5"><div className="bg-brand-lime h-full rounded-full transition-all duration-1000 shadow-xl" style={{ width: `${(completedToday / (habits.length || 1)) * 100}%` }}></div></div>
                  </div>
                  <div className="bg-white dark:bg-brand-gray p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center gap-10 border border-white/5">
                    <StatsChart />
                  </div>
                </div>

                {motivation && <div className="bg-gradient-to-r from-brand-lime/10 to-transparent border-l-4 border-brand-lime rounded-r-[3.5rem] p-12 text-2xl md:text-4xl font-display font-bold leading-tight">"{motivation}"</div>}

                <section className="space-y-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-display font-bold uppercase tracking-tighter leading-none mb-2">{curT.yourHabits}</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{habits.length} ACTIVOS • PLAN {user.subscriptionPlan.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-lime text-black px-10 py-5 rounded-[2rem] text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all transform hover:scale-105 shadow-xl shadow-brand-lime/10"><Plus size={18} /> {curT.add}</button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {habits.map(habit => {
                      const done = habit.completedDates.includes(new Date().toISOString().split('T')[0]);
                      return (
                        <div key={habit.id} onClick={() => toggleHabit(habit.id)} className="bg-white dark:bg-brand-gray border dark:border-white/5 p-10 rounded-[3.5rem] flex flex-col justify-between shadow-2xl cursor-pointer group hover:-translate-y-2 transition-all">
                          <div className="flex justify-between items-start mb-10">
                            <div className={`w-16 h-16 rounded-3xl ${habit.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}><Zap size={32} /></div>
                            <div className={`w-16 h-16 rounded-3xl border-2 flex items-center justify-center transition-all ${done ? 'bg-brand-lime border-brand-lime text-black' : 'border-gray-100 dark:border-white/10 text-gray-300'}`}><Check size={36} strokeWidth={3} /></div>
                          </div>
                          <div>
                            <h3 className={`text-2xl font-display font-bold tracking-tight mb-3 transition-opacity ${done ? 'line-through opacity-20' : ''}`}>{habit.title}</h3>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center gap-3"><Flame size={16} className="text-orange-500" /> {habit.streak} {curT.days}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {view === 'HISTORY' && <History habits={habits} curT={curT} />}
            {view === 'RANKING' && (
              <div className="animate-in slide-in-from-bottom duration-700">
                <h1 className="text-7xl md:text-9xl font-display font-bold uppercase tracking-tighter mb-20 leading-none">{curT.ranking}</h1>
                <div className="space-y-6">
                  {allUsers.sort((a, b) => b.totalXp - a.totalXp).map((u, i) => (
                    <div key={u.email} className={`flex flex-col md:flex-row items-center justify-between p-10 rounded-[4rem] border-2 transition-all gap-8 ${u.email === user.email ? 'border-brand-lime bg-brand-lime/10 shadow-xl' : 'border-transparent bg-white dark:bg-brand-gray shadow-lg'}`}>
                      <div className="flex items-center gap-10 w-full md:w-auto">
                        <span className={`text-5xl font-display font-bold ${i < 3 ? 'text-brand-lime' : 'text-gray-400 opacity-20'}`}>{i + 1}</span>
                        <div className="w-20 h-20 rounded-3xl bg-black/40 flex items-center justify-center text-gray-500 border border-white/5 shadow-inner">{u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover rounded-3xl" /> : <UserIcon size={32} />}</div>
                        <div>
                          <p className="text-4xl font-display font-bold uppercase leading-none mb-2">{u.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{u.totalXp} XP • LEVEL {u.level}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {i === 0 && <div className="px-6 py-2 bg-brand-lime text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">RANK 1</div>}
                        {u.maxStreakRecord && u.maxStreakRecord > 20 && <div className="px-6 py-2 bg-orange-500/20 text-orange-500 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">FUEGO</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'ADVISOR' && <AIChat user={user} curT={curT} />}

            {view === 'PROFILE' && (
              <div className="max-w-4xl mx-auto space-y-16 animate-in zoom-in duration-700">
                <header className="text-center space-y-10">
                  <div className="w-64 h-64 bg-brand-lime rounded-[6rem] mx-auto flex items-center justify-center text-9xl text-black font-display font-bold shadow-2xl relative group border-[12px] border-black">
                    {user.name[0]}
                    <button className="absolute bottom-4 right-4 bg-black text-white p-5 rounded-3xl group-hover:scale-110 transition-all shadow-xl"><Camera size={24} /></button>
                  </div>
                  <div>
                    <h2 className="text-8xl font-display font-bold uppercase tracking-tighter leading-none">{user.name}</h2>
                    <p className="text-brand-lime font-bold uppercase tracking-[0.5em] mt-6 opacity-70">@{user.username} • {user.subscriptionPlan.toUpperCase()}</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white dark:bg-brand-gray p-12 rounded-[4rem] shadow-2xl space-y-10 border border-white/5">
                    <div className="flex items-center gap-6"><Settings className="text-brand-lime" /> <h4 className="font-display font-bold uppercase text-2xl tracking-tight">Preferencias</h4></div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-black/30 p-8 rounded-[2.5rem] border border-white/5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3"><Languages size={18} /> {curT.language}</span>
                        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl">
                          <button onClick={() => changeLanguage('es')} className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${user.language === 'es' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>ES</button>
                          <button onClick={() => changeLanguage('en')} className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${user.language === 'en' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>EN</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-black/30 p-8 rounded-[2.5rem] border border-white/5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3"><Moon size={18} /> {curT.darkMode}</span>
                        <button onClick={toggleDarkMode} className={`w-14 h-8 rounded-full relative transition-all ${isDarkMode ? 'bg-brand-lime' : 'bg-gray-700'}`}>
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-brand-gray p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center gap-8 border border-white/5">
                    <div className="flex items-center gap-4 text-brand-lime"><Target /> <h4 className="font-display font-bold uppercase text-2xl tracking-tight">Estadísticas</h4></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-8 rounded-3xl text-center border border-white/5"><p className="text-4xl font-display font-bold leading-none">{habits.length}</p><p className="text-[9px] font-bold uppercase text-gray-500 mt-3 tracking-widest">Activos</p></div>
                      <div className="bg-black/40 p-8 rounded-3xl text-center border border-white/5"><p className="text-4xl font-display font-bold leading-none">{user.level}</p><p className="text-[9px] font-bold uppercase text-gray-500 mt-3 tracking-widest">Nivel</p></div>
                      <div className="bg-black/40 p-8 rounded-3xl text-center border border-white/5"><p className="text-4xl font-display font-bold leading-none">{user.maxStreakRecord || 0}</p><p className="text-[9px] font-bold uppercase text-gray-500 mt-3 tracking-widest">Racha Máx</p></div>
                      <div className="bg-black/40 p-8 rounded-3xl text-center border border-white/5"><p className="text-4xl font-display font-bold leading-none">{user.totalXp}</p><p className="text-[9px] font-bold uppercase text-gray-500 mt-3 tracking-widest">XP Total</p></div>
                    </div>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-8 rounded-[2.5rem] font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:bg-red-500 hover:text-white transform">Cerrar Sesión</button>
              </div>
            )}
          </main>
          {view === 'HOME' && <RightSidebar />}

          <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 dark:bg-brand-black/90 backdrop-blur-3xl px-10 py-6 flex justify-between items-center z-[90] rounded-[3rem] shadow-2xl border border-white/10">
            {[
              { id: 'HOME', icon: Home }, { id: 'HISTORY', icon: CalendarIcon },
              { id: 'RANKING', icon: Trophy }, { id: 'ADVISOR', icon: MessageSquare }, { id: 'PROFILE', icon: UserIcon }
            ].map(item => (
              <button key={item.id} onClick={() => setView(item.id as any)} className={`transition-all ${view === item.id ? 'text-brand-lime scale-125 drop-shadow-[0_0_8px_#D3FF99]' : 'text-gray-400 opacity-40 hover:opacity-100'}`}>
                <item.icon size={26} />
              </button>
            ))}
          </nav>
        </div>
      )}

      <AddHabitModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={h => {
        const newHabit = { ...h, id: Math.random().toString(36).substr(2, 9), completedDates: [], streak: 0 };
        const newHabitsList = [...habits, newHabit]; setHabits(newHabitsList);
        if (user) storageService.saveHabits(user.email, newHabitsList);
      }} habitCount={habits.length} user={user!} />
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
    if (user.subscriptionPlan === 'free' && habitCount >= 5) {
      setError(curT.errLimitReached);
      return;
    }
    setIsAnalyzing(true); setError(null);
    try {
      const analysis = await analyzeHabitDifficulty(title, description, user.language);
      onSave({ title, description, difficulty: analysis.difficulty, xpReward: analysis.xp, icon: 'Zap', color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)], frequencyType: 'daily' });
      setTitle(''); setDescription(''); onClose();
    } catch (err) { setError("Ocurrió un error al procesar con IA. Inténtalo de nuevo."); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-brand-gray w-full max-w-xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in duration-500 border border-white/10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-4xl font-display font-bold uppercase tracking-tighter text-black dark:text-white leading-none">{curT.newHabit}</h3>
            {user.subscriptionPlan === 'free' && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-3">{habitCount}/5 HÁBITOS USADOS</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2"><X size={32} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">¿Qué quieres lograr?</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ej: Lectura profunda" className="w-full px-8 py-6 rounded-[2rem] border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">Contexto para la IA (Opcional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Leeré 20 páginas de filosofía antes de dormir..." className="w-full px-8 py-6 rounded-[2rem] border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white min-h-[140px] outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all" />
          </div>
          {error && <div className="text-red-500 text-[11px] font-bold text-center bg-red-500/10 p-6 rounded-3xl border border-red-500/20 leading-relaxed uppercase tracking-wider">{error}</div>}
          <button type="submit" disabled={isAnalyzing} className="w-full bg-brand-lime text-black py-8 rounded-[2rem] font-bold uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95 hover:shadow-brand-lime/20">
            {isAnalyzing ? <><Zap className="animate-spin" size={20} /> {curT.analyzing}</> : curT.createHabit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
