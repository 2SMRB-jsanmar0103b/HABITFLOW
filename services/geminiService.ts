import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

const ai = getAI();

export const getAIAdvice = async (message: string, history: {role: string, parts: {text: string}[]}[], language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Eres un experto en formación de hábitos y productividad. 
        Tu objetivo es ayudar al usuario a mejorar su vida. 
        Sé conciso y directo. 
        IMPORTANTE: Usa siempre saltos de línea (doble enter) entre párrafos o ideas para que el texto sea muy legible.
        Usa Markdown para negritas, listas o tablas si ayuda a la claridad.
        No entregues bloques de texto compactos.
        Responde en ${language === 'es' ? 'Español' : 'Inglés'}.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    return language === 'es' ? "Lo siento, mi conexión está saturada." : "Sorry, my connection is busy.";
  }
};

export const generateSuggestedHabits = async (answers: any, language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user's goals: ${JSON.stringify(answers)}, suggest 3 personalized habits.
      For each habit, provide: title, description, and difficulty (easy/medium/hard).
      Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
            },
            required: ['title', 'description', 'difficulty']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const discoverAIHabits = async (category: string, language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 high-impact habits for category: "${category}". 
      Explain why each matters. Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard', 'extreme'] },
              xp: { type: Type.INTEGER }
            },
            required: ['title', 'description', 'difficulty', 'xp']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const analyzeHabitDifficulty = async (habitTitle: string, habitDesc: string, language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze habit: "${habitTitle}" - "${habitDesc}". JSON format please.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard', 'extreme'] },
            xp: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ['difficulty', 'xp', 'reasoning']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { difficulty: 'medium', xp: 20, reasoning: 'Default' };
  }
};

export const getGamifiedFeedback = async (context: any, language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Context: ${JSON.stringify(context)}. Give gamified feedback for completing a habit. Language: ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mensaje: { type: Type.STRING },
            xp: { type: Type.STRING },
            racha: { type: Type.STRING },
            nivel: { type: Type.STRING },
            desbloqueo: { type: Type.STRING }
          },
          required: ['mensaje', 'xp', 'racha', 'nivel', 'desbloqueo']
        },
        systemInstruction: `Eres el motor de experiencia y coach inteligente de HabitFlow, inspirado en Duolingo.
        Tu trabajo es motivar y generar dopamina.
        Tono: Corto, potente, estilo videojuego.
        NO use frases aburridas como "bien hecho" o "sigue así".
        Usa frases potentes: "🔥 +15 XP", "Combo de hábitos", "Estás creando disciplina".
        Si el usuario tiene racha alta, protégela.
        Si sube de nivel, hazlo parecer una evolución.
        Si hay desbloqueo, genera emoción.
        Siempre variado, nunca repetitivo.
        Responde SIEMPRE en el JSON estructurado solicitado.`
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gamified Error:", error);
    return {
      mensaje: language === 'es' ? "¡Hábito Completado!" : "Habit Completed!",
      xp: "+10 XP",
      racha: "",
      nivel: "",
      desbloqueo: ""
    };
  }
};

export const getCoachResponse = async (context: any, action: string = 'daily_greeting', language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${JSON.stringify(context)}. Action: ${action}. Language: ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mensaje_principal: { type: Type.STRING },
            feedback: { type: Type.STRING },
            sugerencias: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerta: { type: Type.STRING },
            modo: { type: Type.STRING, enum: ['normal', 'supervivencia', 'motivacion'] }
          },
          required: ['mensaje_principal', 'feedback', 'sugerencias', 'alerta', 'modo']
        },
        systemInstruction: `Eres el motor de experiencia y coach inteligente dentro de HabitFlow.
        Tu objetivo: Retención, Racha, Progreso, Reducir abandono.
        Tono: Corto (1-2 líneas), acción inmediata, motivador, no genérico.
        No eres una IA, eres un Coach.
        Reglas:
        1. Prioriza acción sobre teoría.
        2. Si fallos recientes >= 3, modo supervivencia.
        3. Siempre JSON estructurado.
        4. Si completó un hábito, feedback de refuerzo positivo.
        5. Máximo 3 sugerencias.`
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Coach Error:", error);
    return {
      mensaje_principal: language === 'es' ? "¡A por ello hoy!" : "Go for it today!",
      feedback: "",
      sugerencias: [],
      alerta: "",
      modo: "normal"
    };
  }
};

export const getMotivationalQuote = async (userName: string, completedCount: number, language: string = 'es') => {
   try {
     if (!ai) throw new Error("AI not initialized");
     const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: `Short quote for ${userName} (${completedCount} habits today). Language: ${language}.`,
     });
     return response.text.trim();
   } catch (e) {
     return language === 'es' ? "¡Sigue adelante!" : "Keep going!";
   }
}

export const getEmergencyHabits = async (type: string, language: string = 'es') => {
  try {
    if (!ai) throw new Error("AI not initialized");
    const concepts = {
      no_time: language === 'es' ? 'Falta de tiempo (micro-hábitos)' : 'Lack of time (micro-habits)',
      no_motivation: language === 'es' ? 'Falta de motivación (activación rápida)' : 'Lack of motivation (quick activation)',
      failed_today: language === 'es' ? 'Recuperación tras fallo (resiliencia)' : 'Recovery after failure (resilience)'
    };
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 mini-habits to combat ${concepts[type as keyof typeof concepts] || type}. 
      Focus on extremely easy actions (2 mins max). Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING, description: "Lucide icon name like Clock, Zap, Heart, Flame" }
            },
            required: ['title', 'description', 'icon']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
