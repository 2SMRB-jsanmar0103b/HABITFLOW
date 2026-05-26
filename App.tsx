
import React, { useState, useEffect, useRef } from 'react';
// Test comment
import Markdown from 'react-markdown';
import * as LucideIcons from 'lucide-react';
import { 
  Home, User as UserIcon, Check, X, Sparkles, LogOut, Moon, Sun as SunIcon,
  Award, Flame, ChevronRight, Trophy, Clock, MessageSquare, Zap, Plus, TrendingUp, UserCheck, Calendar as CalendarIcon, Languages, Settings, Target, ArrowRight,
  Camera, ShieldCheck, Lock, Edit3, Save, Search, Lightbulb, Smile, Frown, Meh, Heart, List, AlertCircle,
  Crown, Rocket, Coffee, Globe, Music, Gem, Shield, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { StatsChart } from './components/StatsChart';
import { HABIT_COLORS, Habit, User, ViewState, Language, MoodType, MoodEntry } from './types';
import { analyzeHabitDifficulty, getMotivationalQuote, getAIAdvice, generateSuggestedHabits, discoverAIHabits, getCoachResponse, getGamifiedFeedback, getEmergencyHabits } from './services/geminiService';
import { storageService } from './services/storageService';

interface CoachData {
  mensaje_principal: string;
  feedback: string;
  sugerencias: string[];
  alerta: string;
  modo: 'normal' | 'supervivencia' | 'motivacion';
}

interface GamifiedFeedback {
  mensaje: string;
  xp: string;
  racha: string;
  nivel: string;
  desbloqueo: string;
  habitId?: string; // Track which habit was completed
}

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
    errPremiumRequired: "El Mentor IA requiere suscripción PREMIUM.",
    errBasicRequired: "El Ranking requiere suscripción BASIC o PREMIUM.",
    errDuplicateHabit: "Ya tienes un hábito con este nombre.",
    errUnderage: "Debes tener al menos 16 años para registrarte.",
    errGuestRestricted: "Registra una cuenta para acceder al Ranking y Mentor IA.",
    birthDate: "Fecha de Nacimiento",
    dailySummary: "Resumen Diario", progress: "Progreso", levelProgress: "Progreso Nivel", rank: "Rango", master: "Maestro",
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
    completedHabits: "Hábitos Finalizados", timeTaken: "Tiempo:", daysElapsed: "días",
    currentPlan: "Plan Actual", changePlan: "Cambiar Plan",
    missions: "Misiones", claimReward: "Reclamar 🎁", customization: "Personalizar", theme: "Tema", iconSet: "Iconos", cursor: "Cursor", missionCompleted: "¡Misión Cumplida!", rewardClaimed: "Recompensa desbloqueada",
    interventionTitle: "Intervención IA", interventionDesc: "HabitFlow ha detectado que necesitas un empujón. Prueba uno de estos micro-hábitos ahora mismo.", emergencyHabits: "Hábitos de Emergencia",
    no_time_title: "Poco Tiempo", no_motivation_title: "Poca Motivación", failed_today_title: "Recuperación",
    exit: "Salir", advisorTitle: "Tu Coach de IA", survivalMode: "Modo Supervivencia",
    noHabitsCompleted: "No hay hábitos completados todavía.", noMoodLogs: "No hay registros de ánimo todavía.",
    noReflections: "Sin reflexiones.", return: "Volver", added: "¡Añadido!",
    advisorGreeting: "¿Cómo puedo ayudarte con tus hábitos hoy?", advisorConsult: "Escribe tu consulta...",
    premiumAccountOnly: "Solo para cuenta premium", customizableColors: "Colores Personalizados",
    habitAdded: "¡Hábito añadido!", emergencyHabitAdded: "¡Hábito de emergencia añadido!",
    moodRecorded: "¡Mood registrado!", ok: "OKEY",
    skipIntervention: "Nah, puedo con mis favoritos",
    next: "Siguiente",
    dailyActivity: "Actividad Diaria", noHabitsInDay: "No hay hábitos en este día.",
    createdHabits: "Hábitos Creados", customPointer: "Puntero", customHand: "Mano", customTarget: "Mira",
    historyDesc: "Consulta tu evolución detallada.", daySelection: "Día seleccionado:",
    default: "Por defecto", salud: "Salud", foco: "Foco", paz: "Paz",
    manana: "Mañana", tarde: "Tarde", noche: "Noche", chill: "Chill", medio: "Medio", hardcore: "Hardcore",
    free: "Gratis", basic: "Básico", premium: "Premium", noHabitsInDayMsg: "No hay hábitos completados.",
    noCreatedHabits: "No hay hábitos creados.", noMoodLogsMsg: "No hay registros de ánimo.",
    missionsList: {
      free1: { title: "Iniciación", desc: "Completa 3 hábitos en total" },
      free2: { title: "Disciplina", desc: "Consigue una racha de 3 días" },
      basic1: { title: "Guerrero Habitual", desc: "Completa 10 hábitos en total" },
      basic2: { title: "Ascenso", desc: "Llega al nivel 5" },
      premium1: { title: "Maestro del Flujo", desc: "Completa 25 hábitos en total" },
      premium2: { title: "Leyenda", desc: "Consigue una racha de 7 días" },
      premium3: { title: "Punisher", desc: "Llega al nivel 10" },
    },
    moodTypes: {
      vSad: "Muy triste", sad: "Triste", neutral: "Neutral", happy: "Feliz", joyful: "Alegre", excellent: "Excelente"
    },
    activityDetails: {
      completed: "Hábitos Completados",
      created: "Hábitos Creados",
      mood: "Estado de Ánimo",
      note: "Nota:"
    },
    paths: {
      focus: "Enfoque Profundo", health: "Cuerpo Vital", peace: "Calma Interior", power: "Productividad Elite"
    },
    chartLegend: { target: "Objetivo Cumplido", process: "En Proceso" },
    graduated: "Graduados", myData: "Mis Datos", system: "Sistema", usernameLabel: "Usuario", nameLabel: "Nombre",
    noAccountYet: "¿No tienes cuenta? Regístrate", alreadyHaveAccount: "¿Ya tienes cuenta? Login",
    createAccount: "Crear Cuenta"
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
    errPremiumRequired: "AI Mentor requires PREMIUM subscription.",
    errBasicRequired: "Ranking requires BASIC or PREMIUM subscription.",
    errDuplicateHabit: "You already have a habit with this name.",
    errUnderage: "You must be at least 16 years old to register.",
    errGuestRestricted: "Register an account to access Ranking and AI Mentor.",
    birthDate: "Birth Date",
    dailySummary: "Daily Summary", progress: "Progress", levelProgress: "Level Progress", rank: "Rank", master: "Master",
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
    completedHabits: "Completed Habits", timeTaken: "Time:", daysElapsed: "days",
    currentPlan: "Current Plan", changePlan: "Change Plan",
    missions: "Missions", claimReward: "Claim 🎁", customization: "Customization", theme: "Theme", iconSet: "Icons", cursor: "Cursor", missionCompleted: "Mission Accomplished!", rewardClaimed: "Reward unlocked",
    interventionTitle: "AI Intervention", interventionDesc: "HabitFlow detected you need a push. Try one of these micro-habits right now.", emergencyHabits: "Emergency Habits",
    no_time_title: "No Time", no_motivation_title: "Low Motivation", failed_today_title: "Recovery",
    exit: "Logout", advisorTitle: "Your AI Coach", survivalMode: "Survival Mode",
    noHabitsCompleted: "No completed habits yet.", noMoodLogs: "No mood records yet.",
    noReflections: "No reflections.", return: "Back", added: "Added!",
    advisorGreeting: "How can I help you with your habits today?", advisorConsult: "Write your query...",
    premiumAccountOnly: "Premium Account Only", customizableColors: "Custom Colors",
    habitAdded: "Habit added!", emergencyHabitAdded: "Emergency habit added!",
    moodRecorded: "Mood recorded!", ok: "OKAY",
    skipIntervention: "Nah, I can handle it",
    next: "Next",
    dailyActivity: "Daily Activity", noHabitsInDay: "No activity on this day.",
    createdHabits: "Created Habits", customPointer: "Pointer", customHand: "Hand", customTarget: "Crosshair",
    historyDesc: "Check your detailed evolution.", daySelection: "Selected day:",
    default: "Default", salud: "Health", foco: "Focus", paz: "Peace",
    manana: "Morning", tarde: "Afternoon", noche: "Night", chill: "Chill", medio: "Medium", hardcore: "Hardcore",
    free: "Free", basic: "Basic", premium: "Premium", noHabitsInDayMsg: "No completed habits.",
    noCreatedHabits: "No created habits.", noMoodLogsMsg: "No mood records.",
    missionsList: {
      free1: { title: "Initiation", desc: "Complete 3 habits in total" },
      free2: { title: "Discipline", desc: "Get a 3-day streak" },
      basic1: { title: "Habit Warrior", desc: "Complete 10 habits in total" },
      basic2: { title: "Ascension", desc: "Reach level 5" },
      premium1: { title: "Flow Master", desc: "Complete 25 habits in total" },
      premium2: { title: "Legend", desc: "Get a 7-day streak" },
      premium3: { title: "Punisher", desc: "Reach level 10" },
    },
    moodTypes: {
      vSad: "Very Sad", sad: "Sad", neutral: "Neutral", happy: "Happy", joyful: "Joyful", excellent: "Excellent"
    },
    activityDetails: {
      completed: "Completed Habits",
      created: "Created Habits",
      mood: "Mood Entry",
      note: "Note:"
    },
    paths: {
      focus: "Deep Focus", health: "Vital Body", peace: "Inner Peace", power: "Elite Productivity"
    },
    chartLegend: { target: "Goal Reached", process: "In Progress" },
    graduated: "Graduated", myData: "My Data", system: "System", usernameLabel: "Username", nameLabel: "Name",
    noAccountYet: "Don't have an account? Register", alreadyHaveAccount: "Already have an account? Login",
    createAccount: "Create Account"
  },
};

import { Mission } from './types';
const MISSIONS: Mission[] = [
  { id: 'free1', title: "Iniciación", description: "Completa 3 hábitos en total", rewardType: 'xp', rewardValue: 50, requiredPlan: 'free', goal: 3, type: 'completed_habits' },
  { id: 'free2', title: "Disciplina", description: "Consigue una racha de 3 días", rewardType: 'xp', rewardValue: 100, requiredPlan: 'free', goal: 3, type: 'streak_record' },
  { id: 'basic1', title: "Guerrero Habitual", description: "Completa 10 hábitos en total", rewardType: 'xp', rewardValue: 250, requiredPlan: 'basic', goal: 10, type: 'completed_habits' },
  { id: 'basic2', title: "Ascenso", description: "Llega al nivel 5", rewardType: 'xp', rewardValue: 500, requiredPlan: 'basic', goal: 5, type: 'level_reach' },
  { id: 'premium1', title: "Maestro del Flujo", description: "Completa 25 hábitos en total", rewardType: 'theme', rewardValue: 'bg-indigo-900', requiredPlan: 'premium', goal: 25, type: 'completed_habits' },
  { id: 'premium2', title: "Leyenda", description: "Consigue una racha de 7 días", rewardType: 'xp', rewardValue: 300, requiredPlan: 'premium', goal: 7, type: 'streak_record' },
  { id: 'premium3', title: "Punisher", description: "Llega al nivel 10", rewardType: 'cursor', rewardValue: 'crosshair', requiredPlan: 'premium', goal: 10, type: 'level_reach' }
];

const MOODS_CONFIG: { type: MoodType, icon: any, color: string }[] = [
  { type: 'vSad', icon: Frown, color: 'text-blue-700' },
  { type: 'sad', icon: Frown, color: 'text-blue-400' },
  { type: 'neutral', icon: Meh, color: 'text-gray-400' },
  { type: 'happy', icon: Smile, color: 'text-brand-lime' },
  { type: 'joyful', icon: Smile, color: 'text-yellow-400' },
  { type: 'excellent', icon: Heart, color: 'text-pink-500' },
];

const CUSTOM_COLORS = [
  { name: 'Verde Lima', class: 'bg-brand-lime text-black', value: '#a3e635' },
  { name: 'Red', class: 'bg-red-500 text-white', value: '#EF4444' },
  { name: 'Blue', class: 'bg-blue-500 text-white', value: '#3B82F6' },
  { name: 'Amber', class: 'bg-amber-500 text-black', value: '#F59E0B' },
  { name: 'Violet', class: 'bg-violet-500 text-white', value: '#8B5CF6' },
  { name: 'Emerald', class: 'bg-emerald-500 text-white', value: '#10B981' },
  { name: 'Pink', class: 'bg-pink-500 text-white', value: '#EC4899' },
  { name: 'Cyan', class: 'bg-cyan-500 text-white', value: '#06B6D4' },
  { name: 'Midnight', class: 'bg-slate-900 text-white', value: '#0f172a' },
  { name: 'Gold', class: 'bg-yellow-600 text-white', value: '#ca8a04' },
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
    { id: 'free', title: curT.free, price: '$0', desc: curT.freeDesc, items: [curT.limit5] },
    { id: 'basic', title: curT.basic, price: '$9', desc: curT.proDesc, items: [curT.unlimited, curT.friendsRanking] },
    { id: 'premium', title: curT.premium, price: '$19', desc: curT.premiumDesc, items: [curT.unlimited, curT.friendsRanking, curT.aiAccess] },
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
    { key: 'goal', label: curT.goalLabel, options: [{l: curT.salud, v: 'health'}, {l: curT.foco, v: 'focus'}, {l: curT.paz, v: 'peace'}] },
    { key: 'energy', label: curT.energyLabel, options: [{l: curT.manana, v: 'morning'}, {l: curT.tarde, v: 'afternoon'}, {l: curT.noche, v: 'night'}] },
    { key: 'intensity', label: curT.intensityLabel, options: [{l: curT.chill, v: 'low'}, {l: curT.medio, v: 'medium'}, {l: curT.hardcore, v: 'high'}] },
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
        <p className="text-xl font-display font-bold uppercase text-black dark:text-white">{current.label}</p>
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
          {step === steps.length - 1 ? curT.generateSuggestions : curT.next} <ArrowRight size={16} />
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
          <div className="text-center py-20 opacity-30 text-black dark:text-white">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">{curT.advisorGreeting}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-2xl text-xs font-sans leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-brand-lime text-black font-bold' : 'bg-black/40 text-gray-300 border border-white/5 shadow-xl'}`}>
              <div className="markdown-body">
                <Markdown>{m.parts[0].text}</Markdown>
              </div>
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
          placeholder={curT.advisorConsult}
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
                <span className="text-[8px] font-bold uppercase tracking-widest text-center text-black dark:text-white">{(curT.moodTypes as any)?.[m.type] || m.type}</span>
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
    { id: 'focus', label: curT.paths.focus, icon: Target, color: 'text-blue-500' },
    { id: 'health', label: curT.paths.health, icon: Flame, color: 'text-orange-500' },
    { id: 'peace', label: curT.paths.peace, icon: Moon, color: 'text-purple-500' },
    { id: 'power', label: curT.paths.power, icon: Zap, color: 'text-brand-lime' },
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
          <button onClick={() => setCategory('')} className="text-gray-500 font-bold uppercase tracking-widest text-[8px] hover:text-black dark:hover:text-white flex items-center gap-2"><ChevronRight size={12} className="rotate-180" /> {curT.return}</button>
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
  const [tab, setTab] = useState<'summary' | 'mood' | 'completed'>('summary');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(new Date().toISOString().split('T')[0]);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = [curT.jan, curT.feb, curT.mar, curT.apr, curT.may, curT.jun, curT.jul, curT.aug, curT.sep, curT.oct, curT.nov, curT.dec];

  const getDayData = (dateStr: string) => {
    const completed = habits.filter(h => h.completedDates.includes(dateStr));
    const created = habits.filter(h => h.createdAt === dateStr);
    const moodLog = user.moodLogs?.filter(m => m.date.startsWith(dateStr));
    const archived = user.completedHabits?.filter(h => h.completedAt.startsWith(dateStr));
    return { completed, created, moodLog, archived };
  };

  const selectedData = selectedDay ? getDayData(selectedDay) : null;

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-6xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-none text-black dark:text-white">{curT.history}</h1>
        <div className="flex bg-brand-gray/5 lg:bg-brand-gray/50 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto max-w-full">
          <button onClick={() => setTab('summary')} className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap transition-all ${tab === 'summary' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500'}`}>{curT.progress}</button>
          <button onClick={() => setTab('completed')} className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap transition-all ${tab === 'completed' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500'}`}>{curT.habitsTab}</button>
          <button onClick={() => setTab('mood')} className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap transition-all ${tab === 'mood' ? 'bg-brand-lime text-black shadow-lg' : 'text-gray-500'}`}>{curT.moodTab}</button>
        </div>
      </header>

      {tab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-left duration-500">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-6 bg-black/5 dark:bg-brand-gray/30 p-4 rounded-2xl border border-black/5 dark:border-white/5 mb-8 w-fit">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:text-brand-lime"><ChevronRight size={18} className="rotate-180"/></button>
              <span className="font-display font-bold uppercase tracking-widest text-sm min-w-[120px] text-center text-black dark:text-white">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:text-brand-lime"><ChevronRight size={18}/></button>
            </div>
            <div className="grid grid-cols-7 gap-2 lg:gap-4">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={i}></div>)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                const { completed } = getDayData(dateStr);
                const total = habits.length;
                const pct = total > 0 ? (completed.length / total) : 0;
                const isSelected = selectedDay === dateStr;
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedDay(dateStr)}
                    className={`aspect-square rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all text-sm font-display font-bold relative ${isSelected ? 'ring-2 ring-brand-lime ring-offset-4 ring-offset-white dark:ring-offset-brand-black' : ''} ${pct === 1 ? 'bg-brand-lime text-black border-brand-lime' : pct > 0.5 ? 'bg-brand-lime/30 border-brand-lime/40 text-black dark:text-white' : pct > 0 ? 'bg-brand-lime/10 border-brand-lime/20 text-black dark:text-white' : 'bg-black/5 dark:bg-brand-gray/20 border-black/5 dark:border-white/5 text-gray-400 dark:text-gray-700'}`}
                  >
                    {i + 1}
                    {isSelected && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-lime rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8 bg-black/5 dark:bg-brand-gray/20 p-10 rounded-[3rem] border border-black/5 dark:border-white/5 h-fit">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{selectedDay}</p>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tighter text-black dark:text-white">{curT.dailyActivity || 'Actividad Diaria'}</h2>
            </div>

            {selectedData && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-lime">{curT.completedHabits}</h4>
                  <div className="space-y-2">
                    {selectedData.completed.length > 0 ? selectedData.completed.map(h => (
                      <div key={h.id} className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                        <Check size={14} className="text-brand-lime" />
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-tight text-black dark:text-white">{h.title}</p>
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest leading-none mt-1">{h.difficulty} • {h.xpReward} XP</p>
                        </div>
                      </div>
                    )) : <p className="text-[10px] text-gray-500 italic">{curT.noHabitsInDayMsg}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-blue-500">{curT.createdHabits}</h4>
                  <div className="space-y-2">
                    {selectedData.created.length > 0 ? selectedData.created.map(h => (
                      <div key={h.id} className="flex items-center gap-3 bg-white dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                        <Plus size={14} className="text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-tight text-black dark:text-white">{h.title}</span>
                      </div>
                    )) : <p className="text-[10px] text-gray-500 italic">{curT.noCreatedHabits}</p>}
                  </div>
                </div>

                {selectedData.archived && selectedData.archived.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">{curT.graduated}</h4>
                    <div className="space-y-2">
                       {selectedData.archived.map(h => (
                         <div key={h.id} className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                            <Plus size={14} className="text-emerald-500" />
                            <div className="flex-1">
                              <p className="text-[10px] font-bold uppercase text-black dark:text-white">{h.title}</p>
                              <p className="text-[8px] text-emerald-600/70 uppercase font-bold">+{h.xpEarned} XP</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-pink-500">{curT.moodTab}</h4>
                  <div className="space-y-2">
                    {selectedData.moodLog && selectedData.moodLog.length > 0 ? selectedData.moodLog.map((m, idx) => {
                      const mConfig = MOODS_CONFIG.find(conf => conf.type === m.mood);
                      const MIcon = mConfig?.icon || Meh;
                      // Translate mood label if available
                      const moodLabel = (curT.moodTypes as any)?.[m.mood] || m.mood;
                      return (
                        <div key={idx} className="bg-gray-50 dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`${mConfig?.color}`}>
                              <MIcon size={16} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight text-black dark:text-white">{moodLabel}</span>
                          </div>
                          {m.note && <p className="text-[10px] text-gray-500 leading-relaxed pl-7 border-l-2 border-pink-500/20 italic">"{m.note}"</p>}
                        </div>
                      );
                    }) : <p className="text-[10px] text-gray-500 italic">{curT.noMoodLogsMsg}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'completed' && (
        <div className="animate-in fade-in duration-500 space-y-4">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-6 text-black dark:text-white">{curT.completedHabits}</h3>
          {user.completedHabits?.length ? (
            <div className="grid gap-4">
              {user.completedHabits.slice().reverse().map((h) => (
                <div key={h.id} className="bg-black/5 dark:bg-brand-gray/30 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold uppercase tracking-tight text-black dark:text-white">{h.title}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                           <CalendarIcon size={12} /> {h.completedAt}
                        </p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{curT.timeTaken}</p>
                        <p className="text-sm font-display font-bold text-brand-lime uppercase">{h.daysToComplete} {curT.daysElapsed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">XP</p>
                        <p className="text-sm font-display font-bold text-black dark:text-white uppercase">+{h.xpEarned}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-20 italic text-black dark:text-white">{curT.noHabitsCompleted}</div>
          )}
        </div>
      )}

      {tab === 'mood' && (
        <div className="animate-in slide-in-from-right duration-500 space-y-4">
          {user.moodLogs?.length ? (
            user.moodLogs.slice().reverse().map((entry, idx) => {
              const moodInfo = MOODS_CONFIG.find(m => m.type === entry.mood);
              const MoodIcon = moodInfo?.icon || Meh;
              return (
                <div key={idx} className="bg-black/5 dark:bg-brand-gray/30 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="flex items-center gap-4 min-w-[150px]">
                    <div className={`w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center ${moodInfo?.color}`}>
                      <MoodIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-brand-lime uppercase tracking-widest leading-none mb-1">{(curT.moodTypes as any)?.[entry.mood] || entry.mood}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic text-xs border-l border-black/10 dark:border-white/10 pl-6 flex-1 line-clamp-3 leading-relaxed">"{entry.note || curT.noReflections}"</p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-black/5 dark:bg-brand-gray/10 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
              <Smile size={40} className="mx-auto text-gray-700 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{curT.noMoodLogs}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Rewards = ({ user, onClaim, curT }: { user: User, onClaim: (m: Mission) => void, curT: any }) => {
  const isClaimed = (id: string) => user.claimedMissions?.includes(id);

  const getProgress = (mission: Mission) => {
    let current = 0;
    if (mission.type === 'completed_habits') current = user.completedHabits?.length || 0;
    if (mission.type === 'habit_count') current = 0; // Not used currently
    if (mission.type === 'streak_record') current = user.maxStreakRecord || 0;
    if (mission.type === 'level_reach') current = user.level;
    return Math.min(current, mission.goal);
  };

  const isComplete = (mission: Mission) => getProgress(mission) >= mission.goal;

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center md:text-left space-y-4">
        <h1 className="text-6xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-none">{curT.rewards}</h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px]">{curT.onboardingDesc}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {MISSIONS.map(m => {
          const progress = getProgress(m);
          const complete = isComplete(m);
          const claimed = isClaimed(m.id);
          const accessible = user.subscriptionPlan === 'premium' || 
                            (user.subscriptionPlan === 'basic' && m.requiredPlan !== 'premium') ||
                            (user.subscriptionPlan === 'free' && m.requiredPlan === 'free');

          return (
            <div className={`p-8 rounded-[2.5rem] bg-gray-50 dark:bg-brand-gray/30 border transition-all flex flex-col gap-6 ${accessible ? 'border-black/5 dark:border-white/5 opacity-100 shadow-xl' : 'border-black/5 dark:border-white/5 opacity-40 grayscale'} ${claimed ? 'border-brand-lime/20 bg-brand-lime/5' : ''}`}>
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight leading-none mb-2">{(curT.missionsList as any)?.[m.id]?.title || m.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{(curT.missionsList as any)?.[m.id]?.desc || m.description}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${claimed ? 'bg-brand-lime text-black' : 'bg-black text-gray-400'}`}>
                    {m.rewardType === 'xp' ? <Zap size={20} /> : <Award size={20} />}
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{progress}/{m.goal}</span>
                    <span className="text-[10px] font-bold text-brand-lime uppercase tracking-widest">{complete ? '100%' : Math.round((progress/m.goal)*100)+'%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress/m.goal)*100}%` }}
                      className="h-full bg-brand-lime shadow-[0_0_10px_#a3e635]"
                    />
                  </div>
               </div>

               <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Premio</span>
                    <span className="text-[10px] font-display font-bold text-white uppercase tracking-tighter">
                      {m.rewardType === 'xp' ? `+${m.rewardValue} XP` : `${m.rewardType}: ${m.rewardValue}`}
                    </span>
                  </div>
                  
                  {!claimed ? (
                    <button 
                      onClick={() => onClaim(m)}
                      disabled={!complete || !accessible}
                      className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all ${complete && accessible ? 'bg-brand-lime text-black shadow-lg hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-600 disabled:opacity-50'}`}
                    >
                      {curT.claimReward}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-lime font-bold uppercase tracking-widest text-[9px]">
                      <Check size={14} /> Canjeado
                    </div>
                  )}
               </div>
               
               {!accessible && (
                 <div className="text-[8px] font-bold uppercase text-brand-lime/60 tracking-widest text-center border-t border-white/5 pt-4">Nivel de plan alto requerido</div>
               )}
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
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState<GamifiedFeedback | null>(null);
  const [interventionModal, setInterventionModal] = useState<{
    open: boolean;
    type: 'no_time' | 'no_motivation' | 'failed_today' | null;
    suggestions: any[];
    loading: boolean;
  }>({ open: false, type: null, suggestions: [], loading: false });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (user?.customization?.themeColorValue && user.subscriptionPlan === 'premium') {
      document.documentElement.style.setProperty('--primary-color', user.customization.themeColorValue);
    } else {
      document.documentElement.style.removeProperty('--primary-color');
    }
  }, [user?.customization?.themeColorValue, user?.subscriptionPlan]);

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
  const [regBirthDate, setRegBirthDate] = useState('');

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

  const fetchCoach = async (action: string = 'daily_greeting') => {
    if (!user) return;
    
    // Si la acción es una de las "emergencias", abrimos el modal de intervención en lugar de solo actualizar el feedback
    if (['no_time', 'no_motivation', 'failed_today'].includes(action)) {
      handleIntervention(action as any);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate global streak as the max streak of any habit
    const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    
    const context = {
      objetivo_usuario: user.subscriptionPlan,
      habitos: habits.map(h => ({ title: h.title, streak: h.streak, done: h.completedDates.includes(today) })),
      racha_actual: currentStreak,
      nivel: user.level,
      xp: user.totalXp,
      fallos_recientes: habits.reduce((acc, h) => {
        let fails = 0;
        const habitCreated = new Date(h.createdAt || today);
        // Only check last 3 days, but NOT before the habit existed
        for (let i = 1; i <= 3; i++) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          // If habit didn't exist yet, it's not a failure
          if (d < habitCreated) continue;
          if (!h.completedDates.includes(dStr)) fails++;
        }
        return acc + fails;
      }, 0),
      ultimo_acceso: new Date().toISOString()
    };
    const response = await getCoachResponse(context, action, user.language);
    setCoachData(response);
    if (response.mensaje_principal) setMotivation(response.mensaje_principal);
  };

  const handleHabitCompletionAI = async (habit: Habit) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const context = {
      user_name: user.name,
      habit_title: habit.title,
      habit_streak: habit.streak + 1,
      user_level: user.level,
      user_xp: user.totalXp + habit.xpReward,
      completed_today: habits.filter(h => h.completedDates.includes(today)).length + 1
    };
    const feedback = await getGamifiedFeedback(context, user.language);
    setCompletionFeedback({ ...feedback, habitId: habit.id });
  };

  useEffect(() => {
    if (user && view === 'HOME') {
      fetchCoach();
    }
  }, [user, view]);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (regPass.length < 6) { setErrorMsg(curT.errPassShort); return; }
    
    // Age validation: User must be at least 16 years old
    const birthDate = new Date(regBirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setErrorMsg(curT.errUnderage);
      return;
    }

    setErrorMsg(null);
    try {
      // Local Registration Logic (Fixing 'Failed to Fetch')
      const existing = storageService.findUser(regEmail);
      if (existing) throw new Error(curT.errUserTaken);

      const newUser: User = { 
        name: regName,
        username: regUser,
        email: regEmail,
        password: regPass, // Added password for persistence
        birthDate: regBirthDate,
        level: 1, 
        currentXp: 0, 
        nextLevelXp: 1000, 
        totalXp: 0, 
        darkMode: isDarkMode, 
        language: 'es', 
        subscriptionPlan: 'free', 
        onboardingCompleted: false, 
        moodLogs: [] 
      };

      storageService.saveUser(newUser);
      setUser(newUser);
      setHabits([]);
      setEditName(newUser.name);
      setEditUsername(newUser.username);
      setView('SUBSCRIPTION_SETUP'); 
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta');
    }
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

  const handleIntervention = async (type: 'no_time' | 'no_motivation' | 'failed_today') => {
    setInterventionModal({ open: true, type, suggestions: [], loading: true });
    try {
      const suggestions = await getEmergencyHabits(type, user?.language || 'es');
      setInterventionModal(prev => ({ ...prev, suggestions, loading: false }));
    } catch (error) {
      setInterventionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClaimMission = (mission: Mission) => {
    if (!user) return;
    if (user.claimedMissions?.includes(mission.id)) return;

    let updatedUser: User = { 
      ...user, 
      claimedMissions: [...(user.claimedMissions || []), mission.id] 
    };

    if (mission.rewardType === 'xp') {
      updatedUser.currentXp += mission.rewardValue;
      updatedUser.totalXp += mission.rewardValue;
      // Handle level up
      if (updatedUser.currentXp >= (updatedUser.nextLevelXp || 1000)) {
        updatedUser.level += 1;
        updatedUser.currentXp -= (updatedUser.nextLevelXp || 1000);
      }
    } else {
      updatedUser.customization = {
        ...(updatedUser.customization || { themeColor: 'default', iconSet: 'default', cursor: 'default' }),
        [mission.rewardType === 'theme' ? 'themeColor' : mission.rewardType === 'icon' ? 'iconSet' : 'cursor']: mission.rewardValue
      };
    }

    setUser(updatedUser);
    storageService.saveUser(updatedUser);
    setSuccessMsg(curT.rewardClaimed);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateCustomization = (key: keyof Customization, value: any, colorValue?: string) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      customization: {
        ...(user.customization || { themeColor: 'default', iconSet: 'default', cursor: 'default' }),
        [key]: value,
        ...(colorValue ? { themeColorValue: colorValue } : {})
      }
    };
    setUser(updatedUser);
    storageService.saveUser(updatedUser);
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
    setSuccessMsg(curT.moodRecorded); setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => {
      const hToToggle = prev.find(h => h.id === id);
      const wasDone = hToToggle?.completedDates.includes(today);

      const newHabits = prev.map(h => {
        if (h.id === id) {
          const done = h.completedDates.includes(today); 
          return { ...h, completedDates: done ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today], streak: done ? Math.max(0, h.streak - 1) : h.streak + 1 };
        }
        return h;
      });
      if (user) {
        storageService.saveHabits(user.email, newHabits);
        if (!wasDone) {
          fetchCoach('habit_completed');
          if (hToToggle) handleHabitCompletionAI(hToToggle);
        }
      }
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

  const handleViewChange = (newView: ViewState) => {
    if (user?.isGuest && (newView === 'RANKING' || newView === 'ADVISOR')) {
      setErrorMsg(curT.errGuestRestricted);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    if (newView === 'ADVISOR' && user?.subscriptionPlan !== 'premium') {
      setErrorMsg(curT.errPremiumRequired);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (newView === 'RANKING' && user?.subscriptionPlan === 'free') {
      setErrorMsg(curT.errBasicRequired);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setView(newView);
  };

  const completedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;

  const RightSidebar = () => (
    <div className="hidden xl:flex flex-col w-72 h-screen fixed right-0 top-0 bg-white dark:bg-brand-gray border-l dark:border-white/10 p-8 overflow-y-auto z-40">
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse" />
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em]">{curT.activeStreak}</h4>
          </div>
          <div className="bg-gray-100 dark:bg-black/50 p-6 rounded-3xl flex items-center gap-4 border border-black/5 dark:border-white/5 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Flame size={24} /></div>
            <div>
              <p className="text-4xl font-display font-bold leading-none text-black dark:text-white">12</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{curT.days}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">{curT.stats}</h4>
          <div className="space-y-3">
             {[
               { label: curT.stats, value: user?.totalXp, icon: Zap },
               { label: curT.level, value: user?.level, icon: Award }
             ].map((stat, i) => (
               <div key={i} className="bg-black/30 p-5 rounded-2xl flex justify-between items-center border border-white/5 group hover:border-brand-lime/30 transition-colors">
                 <div className="flex items-center gap-3">
                   <stat.icon size={12} className="text-gray-500 group-hover:text-brand-lime transition-colors" />
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                 </div>
                 <span className="font-display font-bold text-xl">{stat.value}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-lime/10 to-transparent border border-brand-lime/20 p-8 rounded-[2.5rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lime/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-brand-lime/10 transition-all" />
            <Award className="mx-auto text-brand-lime mb-4 group-hover:scale-110 transition-transform" size={40} />
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.2em]">{curT.master}</p>
            <div className="mt-4 w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '80%' }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="bg-brand-lime h-full rounded-full shadow-[0_0_10px_rgba(163,230,53,0.3)]" 
               />
            </div>
            <p className="text-[8px] text-gray-500 mt-3 font-bold uppercase tracking-[0.2em]">{curT.levelProgress}</p>
        </div>
      </div>
    </div>
  );

  const archiveHabit = (habitId: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) {
      setCompletionFeedback(null);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const createdDate = habit.createdAt || today;
    const diffTime = Math.abs(new Date(today).getTime() - new Date(createdDate).getTime());
    const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const completedEntry = {
      id: habit.id,
      title: habit.title,
      createdAt: createdDate,
      completedAt: today,
      daysToComplete: daysElapsed,
      xpEarned: habit.xpReward
    };

    const updatedUser: User = {
      ...user,
      completedHabits: [...(user.completedHabits || []), completedEntry]
    };

    const updatedHabits = habits.filter(h => h.id !== habitId);
    
    setUser(updatedUser);
    setHabits(updatedHabits);
    storageService.saveUser(updatedUser);
    storageService.saveHabits(user.email, updatedHabits);
    setCompletionFeedback(null);
  };

  const CompletionSplash = ({ data }: { data: GamifiedFeedback }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 dark:bg-black/98 backdrop-blur-3xl">
        <div className="bg-white dark:bg-brand-gray border-2 border-brand-lime p-10 rounded-[3.5rem] shadow-[0_0_80px_rgba(163,230,53,0.3)] text-center max-w-sm w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-lime" />
          
          <div className="w-24 h-24 bg-brand-lime rounded-full mx-auto flex items-center justify-center text-black mb-10 shadow-2xl">
            <Zap size={48} strokeWidth={3} />
          </div>

          <h2 className="text-3xl font-display font-bold uppercase tracking-tighter mb-6 leading-tight text-brand-black dark:text-white">
            {data.mensaje}
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {data.xp && <div className="bg-brand-lime text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">{data.xp}</div>}
            {data.racha && <div className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg"><Flame size={14}/> {data.racha}</div>}
            {data.nivel && <div className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">{data.nivel}</div>}
          </div>
          
          <button 
            onClick={() => data.habitId ? archiveHabit(data.habitId) : setCompletionFeedback(null)}
            className="mt-12 w-full py-5 bg-brand-lime text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all font-sans cursor-pointer group"
          >
            <span className="flex items-center justify-center gap-2">
              {curT.ok} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen bg-white dark:bg-brand-black text-black dark:text-white transition-colors duration-300 overflow-x-hidden font-sans ${user?.customization?.themeColor && user.customization.themeColor !== 'default' ? user.customization.themeColor : ''}`}
      style={{ cursor: user?.customization?.cursor && user.customization.cursor !== 'default' ? user.customization.cursor : 'inherit' }}
    >
      {completionFeedback && <CompletionSplash data={completionFeedback} />}
      <AnimatePresence mode="wait">
        {view === 'LANDING' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          >
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", damping: 15 }}
             >
               <Logo className="w-48 h-48 lg:w-56 lg:h-56" />
             </motion.div>
             <div className="mt-12 max-w-4xl mx-auto px-4">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-6 leading-none"
                >
                  {curT.landingTitle}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-base lg:text-lg max-w-xl mb-12 leading-relaxed mx-auto"
                >
                  {curT.landingDesc}
                </motion.p>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button onClick={() => setView('LOGIN')} className="bg-brand-lime text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">{curT.startNow}</button>
                  <button onClick={handleGuestLogin} className="bg-white/5 text-gray-400 border border-white/10 px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-[10px] hover:text-white transition-all">{curT.accessAsGuest}</button>
                </motion.div>
             </div>
          </motion.div>
        )}

        {(view === 'LOGIN' || view === 'REGISTER') && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col md:flex-row"
          >
             <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-20 bg-black border-r border-white/5 relative">
               <Logo className="w-56 h-56 lg:w-72 lg:h-72 relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-lime/10 to-transparent opacity-50" />
             </div>
             <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative">
               <button onClick={() => setView('LANDING')} className="absolute top-10 left-10 text-gray-400 font-bold uppercase tracking-widest text-[8px] flex items-center gap-2 hover:text-white transition-colors"><ChevronRight size={12} className="rotate-180" /> {curT.return}</button>
               <div className="w-full max-w-xs">
                  <h2 className="text-4xl lg:text-5xl font-display font-bold mb-8 tracking-tighter uppercase leading-none">{view === 'LOGIN' ? curT.login : curT.register}</h2>
                  {errorMsg && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500 text-[9px] font-bold mb-6 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center uppercase tracking-widest">{errorMsg}</motion.div>}
                  <form onSubmit={view === 'LOGIN' ? handleLogin : handleRegister} className="space-y-2.5">
                    {view === 'REGISTER' && (
                      <>
                        <input type="text" required placeholder={curT.name} value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                        <input type="text" required placeholder={curT.username} value={regUser} onChange={e => setRegUser(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest pl-2">{curT.birthDate}</label>
                          <input type="date" required value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                        </div>
                      </>
                    )}
                    <input type={view === 'LOGIN' ? "text" : "email"} required placeholder={view === 'LOGIN' ? curT.userOrEmail : curT.email} value={view === 'LOGIN' ? loginId : regEmail} onChange={e => view === 'LOGIN' ? setLoginId(e.target.value) : setRegEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                    <input type="password" required placeholder={curT.password} value={view === 'LOGIN' ? loginPass : regPass} onChange={e => view === 'LOGIN' ? setLoginPass(e.target.value) : setRegPass(e.target.value)} className="w-full bg-gray-50 dark:bg-brand-gray/30 border dark:border-white/5 rounded-xl p-4 text-xs outline-none focus:border-brand-lime/20" />
                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-brand-lime text-black py-5 rounded-xl font-bold uppercase tracking-widest mt-4 shadow-xl text-[10px]">
                      {view === 'LOGIN' ? curT.login : curT.createAccount}
                    </motion.button>
                  </form>
                  <div className="flex justify-center mt-8">
                    <button onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-gray-500 font-bold uppercase tracking-widest text-[8px] hover:text-white">{view === 'LOGIN' ? curT.noAccountYet : curT.alreadyHaveAccount}</button>
                  </div>
               </div>
             </div>
          </motion.div>
        )}

        {user && view !== 'LANDING' && view !== 'LOGIN' && view !== 'REGISTER' && (
          <motion.div 
            key="app-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col md:flex-row min-h-screen"
          >
           <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen fixed left-0 top-0 bg-white dark:bg-brand-gray border-r dark:border-white/5 p-8 z-50">
              <div className="mb-12 flex justify-center"><Logo className="w-20 h-20" showText={false} /></div>
              <nav className="flex-1 space-y-1">
                {[
                  { id: 'HOME', icon: Home, label: curT.home }, 
                  { id: 'DISCOVER', icon: Lightbulb, label: curT.discover },
                  { id: 'MOOD', icon: Smile, label: curT.mood },
                  { id: 'HISTORY', icon: CalendarIcon, label: curT.history },
                  { id: 'REWARDS', icon: Award, label: curT.rewards },
                  { id: 'RANKING', icon: Trophy, label: curT.ranking }, 
                  { id: 'ADVISOR', icon: MessageSquare, label: curT.advisor }, 
                  { id: 'PROFILE', icon: UserIcon, label: curT.profile }
                ].map(item => (
                  <button key={item.id} onClick={() => handleViewChange(item.id as ViewState)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] transition-all ${view === item.id ? 'bg-brand-lime text-black shadow-lg shadow-brand-lime/10' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest text-[8px] p-2 transition-colors"><LogOut size={14} /> {curT.exit}</button>
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
                     <StatsChart isDarkMode={isDarkMode} />
                   </div>
                 </div>

                 {coachData ? (
                  <motion.div 
                    key={coachData.mensaje_principal}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-[2.5rem] border-2 shadow-2xl relative overflow-hidden transition-all duration-500 ${coachData.modo === 'supervivencia' ? 'border-red-500/20 bg-red-500/5' : 'border-brand-lime/20 bg-brand-lime/5'}`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Sparkles size={40} className="text-brand-lime" />
                    </div>
                    
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${coachData.modo === 'supervivencia' ? 'bg-red-500 text-white' : 'bg-brand-lime text-black'} shadow-lg`}>
                <Zap size={20}/>
              </div>
              <h4 className="font-display font-bold uppercase tracking-tight text-lg text-black dark:text-white">{curT.advisorTitle}</h4>
              {coachData.modo === 'supervivencia' && <span className="bg-red-500 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full animate-pulse ml-auto">{curT.survivalMode}</span>}
            </div>

                    <p className="text-xl lg:text-3xl font-display font-medium tracking-tight mb-8 leading-tight italic">
                      "{coachData.feedback || coachData.mensaje_principal}"
                    </p>

                    {coachData.alerta && (
                      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8">
                        <AlertCircle size={16} className="text-red-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">{coachData.alerta}</p>
                      </div>
                    )}

                    {coachData.sugerencias.length > 0 && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {coachData.sugerencias.map((s, i) => (
                          <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center gap-3 group hover:border-brand-lime/30 transition-all">
                            <div className="w-2 h-2 bg-brand-lime rounded-full group-hover:scale-150 transition-transform" />
                            <p className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-white transition-colors">{s}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                       {[
                         { label: "No tengo tiempo", action: "no_time" },
                         { label: "No tengo motivación", action: "no_motivation" },
                         { label: "Fallé hoy", action: "failed_today" }
                       ].map((btn, i) => (
                         <button 
                           key={i} 
                           onClick={() => fetchCoach(btn.action)}
                           className="px-5 py-2.5 bg-black/40 hover:bg-brand-lime hover:text-black rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/10 transition-all active:scale-95 text-white"
                         >
                           {btn.label}
                         </button>
                       ))}
                    </div>
                  </motion.div>
                ) : (
                  motivation && <div className="bg-gradient-to-r from-brand-lime/10 to-transparent border-l-4 border-brand-lime rounded-r-2xl p-6 lg:p-8 text-lg lg:text-2xl font-display font-bold leading-tight italic">"{motivation}"</div>
                )}

                 <section className="space-y-8">
                   <div className="flex justify-between items-end">
                     <h2 className="text-2xl lg:text-3xl font-display font-bold uppercase tracking-tighter leading-none">{curT.yourHabits}</h2>
                     <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-lime text-black px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Plus size={14}/> {curT.add}</button>
                   </div>
                   <motion.div 
                     key={habits.length + completedToday}
                     initial="hidden"
                     animate="show"
                     variants={{
                       hidden: { opacity: 0 },
                       show: {
                         opacity: 1,
                         transition: {
                           staggerChildren: 0.05
                         }
                       }
                     }}
                     className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                   >
                     {habits.map(habit => {
                       const done = habit.completedDates.includes(new Date().toISOString().split('T')[0]);
                       return (
                         <motion.div 
                           key={habit.id} 
                           variants={{
                             hidden: { opacity: 0, scale: 0.9, y: 20 },
                             show: { opacity: 1, scale: 1, y: 0 }
                           }}
                           whileHover={{ y: -5, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => toggleHabit(habit.id)} 
                           className="bg-white dark:bg-brand-gray border dark:border-white/10 p-6 rounded-[2rem] shadow-xl cursor-pointer group transition-all"
                         >
                           <div className="flex justify-between items-start mb-6">
                             <div className={`w-12 h-12 rounded-xl ${habit.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}><Zap size={24} /></div>
                             <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${done ? 'bg-brand-lime border-brand-lime text-black' : 'border-gray-100 dark:border-white/10 text-gray-300'}`}><Check size={28} strokeWidth={3} /></div>
                           </div>
                           <h3 className={`text-lg lg:text-xl font-display font-bold uppercase tracking-tight mb-1 ${done ? 'line-through opacity-20' : ''}`}>{habit.title}</h3>
                           <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Flame size={12} className="text-orange-500" /> {habit.streak} {curT.days}</p>
                         </motion.div>
                       );
                     })}
                   </motion.div>
                 </section>
               </div>
             )}

             {view === 'DISCOVER' && (
               <AIDiscoverView 
                 user={user} habits={habits} curT={curT} 
                 onAddHabit={(opt) => {
                   if (user.subscriptionPlan === 'free' && habits.length >= 5) { setErrorMsg(curT.errLimitReached); return; }
                   if (habits.some(h => h.title.toLowerCase() === opt.title.toLowerCase())) { setErrorMsg(curT.errDuplicateHabit); return; }
                    const newH: Habit = { 
                      ...opt, 
                      id: Math.random().toString(36).substr(2,9), 
                      completedDates:[], 
                      streak:0, 
                      xpReward: opt.xp, 
                      icon: 'Zap', 
                      color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)], 
                      frequencyType: 'daily',
                      createdAt: new Date().toISOString().split('T')[0]
                    };
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
                    {allUsers
                      .filter(u => !u.isGuest)
                      .sort((a,b) => b.totalXp - a.totalXp)
                      .map((u, i) => (
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
             {view === 'REWARDS' && <Rewards user={user} onClaim={handleClaimMission} curT={curT} />}

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
                     <div className="flex items-center gap-4"><Edit3 className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">{curT.myData}</h4></div>
                     <div className="space-y-4">
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder={curT.nameLabel} className="w-full bg-gray-100 dark:bg-black/30 border border-black/5 dark:border-white/5 p-4 rounded-xl outline-none text-base font-display uppercase tracking-tight text-black dark:text-white" />
                        <input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder={curT.usernameLabel} className="w-full bg-gray-100 dark:bg-black/30 border border-black/5 dark:border-white/5 p-4 rounded-xl outline-none text-base font-display uppercase tracking-tight text-black dark:text-white" />
                        <button onClick={handleUpdateProfile} className="w-full bg-brand-lime text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg hover:scale-[1.02] transition-all"><Save size={14} /> {curT.saveChanges}</button>
                     </div>
                   </div>
                   <div className="bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl space-y-8 border border-white/5">
                     <div className="flex items-center gap-4"><Settings className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">{curT.system}</h4></div>
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
                     <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">{curT.exit}</button>
                    </div>

                    <div className="md:col-span-2 bg-white dark:bg-brand-gray p-10 rounded-[2.5rem] shadow-xl space-y-8 border border-white/5">
                      {user.subscriptionPlan === 'premium' && (
                        <div className="mb-10 pb-10 border-b border-white/5 space-y-12">
                          <div className="flex items-center gap-4"><Sparkles className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">{curT.customization}</h4></div>
                          
                          <div className="space-y-10">
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2">{curT.customizableColors}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                   {CUSTOM_COLORS.map(c => (
                                     <button 
                                       key={c.name} 
                                       onClick={() => handleUpdateCustomization('themeColor', c.class, c.value)}
                                       className={`group relative aspect-square rounded-2xl ${c.class} flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${user.customization?.themeColor === c.class ? 'ring-4 ring-brand-lime' : ''}`}
                                     >
                                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Check size={20} />
                                       </div>
                                     </button>
                                   ))}
                                </div>
                             </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] pl-2">{curT.cursor}</p>
              <div className="flex flex-wrap gap-3">
                 <button onClick={() => handleUpdateCustomization('cursor', 'default')} className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-md ${user.customization?.cursor === 'default' || !user.customization?.cursor ? 'bg-brand-lime text-black' : 'bg-black/40 text-gray-500'}`}>{curT.default || 'Default'}</button>
                 <button onClick={() => handleUpdateCustomization('cursor', 'pointer')} className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-md ${user.customization?.cursor === 'pointer' ? 'bg-brand-lime text-black' : 'bg-black/40 text-gray-500'}`}>{curT.customHand}</button>
                 <button onClick={() => handleUpdateCustomization('cursor', 'crosshair')} className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-md ${user.customization?.cursor === 'crosshair' ? 'bg-brand-lime text-black' : 'bg-black/40 text-gray-500'}`}>{curT.customTarget}</button>
              </div>
            </div>
                          </div>
                        </div>
                      )}

                      {user.subscriptionPlan !== 'premium' && (
                        <div className="mb-10 p-8 bg-brand-lime/10 border border-brand-lime/20 rounded-3xl flex flex-col items-center text-center gap-4">
                           <Lock className="text-brand-lime" size={32} />
                           <h4 className="text-xl font-display font-bold uppercase tracking-tight leading-none">{curT.premiumAccountOnly}</h4>
                           <p className="text-xs text-gray-500 font-medium">{user.language === 'en' ? 'Customize colors, icons and cursors with the Premium plan.' : 'Personaliza colores de botones, iconos globales y cursores con el plan Premium.'}</p>
                        </div>
                      )}
 
                      <div className="flex items-center gap-4"><Award className="text-brand-lime" size={20} /> <h4 className="font-display font-bold uppercase text-lg lg:text-xl tracking-tight">{translations[user.language].selectPlan || 'Suscripción'}</h4></div>
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

           <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/95 dark:bg-brand-black/95 backdrop-blur-3xl px-8 py-4 flex justify-between items-center z-[90] rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10">
              {[
                { id: 'HOME', icon: Home }, { id: 'DISCOVER', icon: Lightbulb }, { id: 'REWARDS', icon: Award },
                { id: 'RANKING', icon: Trophy }, { id: 'PROFILE', icon: UserIcon }
              ].map(item => (
                <button key={item.id} onClick={() => handleViewChange(item.id as any)} className={`transition-all ${view === item.id ? 'text-brand-lime scale-125' : 'text-gray-400 opacity-40'}`}>
                  <item.icon size={20} />
                </button>
              ))}
           </nav>
        </motion.div>
      )}
    </AnimatePresence>

      <AddHabitModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={h => {
        if (habits.some(ex => ex.title.toLowerCase() === h.title.toLowerCase())) {
          setErrorMsg(curT.errDuplicateHabit); setTimeout(() => setErrorMsg(null), 5000); return;
        }
        const newH: Habit = {
          ...h, 
          id: Math.random().toString(36).substr(2,9), 
          completedDates:[], 
          streak:0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        const updated = [...habits, newH]; setHabits(updated);
        if (user) storageService.saveHabits(user.email, updated);
      }} habitCount={habits.length} user={user!} />

      <InterventionModal 
        isOpen={interventionModal.open} 
        onClose={() => setInterventionModal(prev => ({ ...prev, open: false }))}
        type={interventionModal.type}
        suggestions={interventionModal.suggestions}
        loading={interventionModal.loading}
        curT={curT}
        onAddHabit={(title, desc) => {
          if (!user) return;
          if (habits.length >= 5 && user.subscriptionPlan === 'free') {
             setErrorMsg(curT.errLimitReached); setTimeout(() => setErrorMsg(null), 5000); return;
          }
          if (habits.some(ex => ex.title.toLowerCase() === title.toLowerCase())) {
            setErrorMsg(curT.errDuplicateHabit); setTimeout(() => setErrorMsg(null), 5000); return;
          }
          const newH: Habit = {
            id: Math.random().toString(36).substring(2, 11),
            title,
            description: desc,
            icon: 'Sparkles',
            color: 'bg-brand-lime',
            difficulty: 'easy',
            frequencyType: 'daily',
            xpReward: 10,
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };
          const updated = [...habits, newH];
          setHabits(updated);
          storageService.saveHabits(user.email, updated);
          setSuccessMsg(curT.emergencyHabitAdded);
          setTimeout(() => setSuccessMsg(null), 3000);
        }} 
      />

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
    } catch (err) { setError(user.language === 'en' ? "Connection failure" : "Fallo de conexión"); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-brand-gray w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-white/10 relative">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-display font-bold uppercase tracking-tighter text-black dark:text-white leading-none">{curT.newHabit}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder={curT.name} className="w-full px-5 py-4 rounded-xl border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white outline-none text-xs font-display uppercase tracking-tight" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={user.language === 'en' ? "Why?" : "¿Por qué?"} className="w-full px-5 py-4 rounded-xl border dark:border-white/10 bg-white dark:bg-black text-black dark:text-white min-h-[100px] outline-none text-xs" />
          {error && <div className="text-red-500 text-[8px] font-bold text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20 uppercase tracking-widest">{error}</div>}
          <button type="submit" disabled={isAnalyzing} className="w-full bg-brand-lime text-black py-5 rounded-xl font-bold uppercase tracking-[0.3em] shadow-xl text-[10px]">
            {isAnalyzing ? <div className="flex items-center justify-center gap-3"><Zap className="animate-spin" size={14} /> {curT.analyzing}</div> : curT.createHabit}
          </button>
        </form>
      </div>
    </div>
  );
};

const InterventionModal = ({ isOpen, onClose, type, suggestions, loading, curT, onAddHabit }: { isOpen: boolean, onClose: () => void, type: string | null, suggestions: any[], loading: boolean, curT: any, onAddHabit: (title: string, desc: string) => void }) => {
  if (!isOpen) return null;

  const titles = {
    no_time: curT.no_time_title || "Poco Tiempo",
    no_motivation: curT.no_motivation_title || "Poca Motivación",
    failed_today: curT.failed_today_title || "Recuperación"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-brand-gray border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-10 space-y-8"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-black animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-lime">{curT.interventionTitle}</h3>
                </div>
                <h2 className="text-3xl font-display font-bold uppercase tracking-tighter leading-none text-black dark:text-white">{titles[type as keyof typeof titles] || curT.interventionTitle}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-black/40 hover:bg-brand-lime text-white hover:text-black rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{curT.interventionDesc}</p>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{curT.emergencyHabits}</h4>
              <div className="grid gap-4">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div className="w-12 h-12 border-4 border-brand-lime/20 border-t-brand-lime rounded-full animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-lime">{curT.analyzing}</p>
                  </div>
                ) : (
                  suggestions.map((s, i) => {
                    const SvgIcon = (LucideIcons as any)[s.icon] || Zap;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-black/5 dark:bg-black/40 p-6 rounded-3xl border border-black/5 dark:border-white/5 hover:border-brand-lime/30 transition-all flex items-center gap-6"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-brand-lime/10 flex items-center justify-center text-brand-lime group-hover:scale-110 transition-transform">
                          <SvgIcon size={24} />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white mb-1">{s.title}</h5>
                          <p className="text-[10px] text-gray-500 font-medium leading-normal">{s.description}</p>
                        </div>
                        <button 
                          onClick={() => {
                            onAddHabit(s.title, s.description);
                            onClose();
                          }}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-lime active:scale-90"
                        >
                          <Plus size={18} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {!loading && (
              <button 
                onClick={onClose}
                className="w-full py-5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all"
              >
                {curT.skipIntervention}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default App;
