import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. BUSCAR SESSÕES
  async function fetchSessions() {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversas:', error);
    } else {
      setSessions(data || []);
      if (data && data.length > 0) {
        setActiveSessionId(data[0].id);
      } else {
        createFirstSession();
      }
    }
  }

  // 2. BUSCAR MENSAGENS
  async function fetchMessages(sessionId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
    } else {
      setMessages(data || []);
    }
  }

  // 3. CRIAR PRIMEIRA SESSÃO (Fallback)
  async function createFirstSession() {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ title: 'Nova Conversa' }])
      .select();

    if (!error && data && data.length > 0) {
      setSessions([data[0]]);
      setActiveSessionId(data[0].id);
    }
  }

  // 4. CRIAR NOVA SESSÃO
  const createNewSession = async () => {
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert([{ title: 'Nova Conversa' }])
      .select();

    if (error) {
      console.error('Erro ao criar nova conversa:', error);
    } else if (newSession && newSession.length > 0) {
      setSessions([newSession[0], ...sessions]);
      setActiveSessionId(newSession[0].id);
      setMessages([]);
    }
  };

  // 5. DELETAR SESSÃO DIRETAMENTE PELA SIDEBAR
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation(); 
    if (!window.confirm("Deseja excluir esta conversa permanentemente?")) return;

    try {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
      
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(filteredSessions);
      
      if (activeSessionId === sessionId) {
        if (filteredSessions.length > 0) {
          setActiveSessionId(filteredSessions[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
          createNewSession(); 
        }
      }
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
    }
  };

  // 6. ENVIAR MENSAGEM (Integração com a API da GROQ)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMsg = { 
      session_id: activeSessionId,
      role: 'user', 
      content: userMessage 
    };
    
    const currentMessages = [...messages, { ...newUserMsg, id: Date.now() }];
    setMessages(currentMessages);

    try {
      // 1. Salva a mensagem do usuário no banco
      await supabase.from('chat_messages').insert([newUserMsg]);

      // 2. Renomeia sessão automaticamente (seu código original - mantido)
      const currentSession = sessions.find(s => s.id === activeSessionId);
      if (currentSession && currentSession.title === 'Nova Conversa') {
        const newTitle = userMessage.length > 25 ? userMessage.substring(0, 25) + '...' : userMessage;
        await supabase.from('chat_sessions').update({ title: newTitle }).eq('id', activeSessionId);
        setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
      }

      // 3. Prepara mensagens para a IA
      const apiMessages = currentMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      apiMessages.unshift({ 
        role: 'system', 
        content: 'Você é o Buzzer AI, um assistente virtual altamente especializado em apicultura, manejo de colmeias e produção de mel. Responda sempre de forma clara, técnica, mas acessível. Use um tom prestativo e evite textos excessivamente longos se a pergunta for simples.' 
      });

      // 4. CHAMA O SEU SERVIDOR NODE.JS EM VEZ DA GROQ DIRETAMENTE!
      const response = await fetch('http://localhost:5000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        throw new Error('Falha ao conectar com o servidor Buzzer.');
      }

      const data = await response.json();
      const aiResponseText = data.reply; // Pegamos a resposta mastigada do Node

      // 5. Salva a resposta da IA no banco
      const newAiMsg = { 
        session_id: activeSessionId,
        role: 'assistant', 
        content: aiResponseText 
      };

      const { data: aiData, error } = await supabase
        .from('chat_messages')
        .insert([newAiMsg])
        .select();

      if (error) throw error;

      setMessages((prev) => [...prev, aiData[0]]);
      
    } catch (error) {
      console.error('Erro no fluxo do chat:', error);
      
      const errorMsg = { 
        session_id: activeSessionId,
        role: 'assistant', 
        content: `⚠️ Zumbido com erro: ${error.message}` 
      };
      setMessages((prev) => [...prev, { ...errorMsg, id: Date.now() }]);
    } finally {
      setIsLoading(false); // Movido para o finally para garantir que sempre execute
    }
  };

  return (
    <div className="flex h-full bg-[#1E1F22] text-gray-200 overflow-hidden font-sans">
      
      {/* SIDEBAR DE SESSÕES */}
      <aside className="w-72 border-r border-gray-800 flex flex-col bg-[#1B1C1F] flex-shrink-0 transition-all">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1B1C1F] z-10">
          <div>
            <h2 className="text-[#EAAA40] font-black uppercase tracking-tighter text-xl">BUZZER HUB</h2>
            <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Apiário Digital</span>
          </div>
          <button onClick={createNewSession} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-[#EAAA40] hover:text-[#1A1814] transition-all" title="Nova Conversa">
            ＋
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="flex flex-col gap-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group border border-transparent
                  ${activeSessionId === session.id 
                    ? 'bg-[#2A2B30] border-gray-700' 
                    : 'hover:bg-[#232429]'}
                `}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <span className={`truncate block text-sm ${activeSessionId === session.id ? 'text-[#EAAA40] font-bold' : 'text-gray-400 font-medium group-hover:text-gray-300'}`} title={session.title}>
                    {session.title}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all
                    ${activeSessionId === session.id ? 'opacity-100' : ''}
                  `}
                  title="Excluir Conversa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CHAT */}
      <main className="flex-1 flex flex-col bg-[#1E1F22]">
        <div className="px-10 py-5 border-b border-gray-800 bg-[#232429] flex justify-between items-center h-[75px] flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">BUZZER AI</h1>
            <p className="text-green-500 text-[10px] uppercase tracking-widest mt-0.5 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span> Online e salvando automaticamente
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-transparent">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center animate-fade-in">
              <img src="/buzzer_hive_minimalist.png" alt="Buzzer Hive" className="w-24 h-24 object-contain mb-4" />
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">Pronto para analisar dados.</p>
              <p className="text-xs text-gray-600 max-w-sm mt-2">Envie suas dúvidas sobre manejo, florada ou laudos apícolas.</p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#2A2B30] border border-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src="/buzzer_bee_minimalist.png" alt="Buzzer AI" className="w-5 h-5 object-contain" />
                  </div>
                )}
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-[#EAAA40] text-[#1A1814] rounded-tr-sm font-medium' 
                      : 'bg-[#232429] text-gray-300 border border-gray-800 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-[#2A2B30] border border-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                  🐝
                </div>
                <div className="bg-[#232429] text-gray-300 border border-gray-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse shadow-sm"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-75 shadow-sm"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-150 shadow-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-6 md:px-10 pb-8 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="bg-[#232429] border border-gray-700 focus-within:border-gray-500 rounded-2xl p-2 flex gap-2 transition-all shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao Buzzer AI..."
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 px-4 py-3 focus:outline-none text-sm leading-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center flex-shrink-0
                ${!input.trim() || isLoading
                  ? 'text-gray-700 bg-transparent cursor-not-allowed border border-gray-700'
                  : 'bg-[#EAAA40] text-[#1A1814] hover:bg-[#f0ba59] active:scale-95'
                }
              `}
              title="Enviar mensagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transform rotate-[-35deg]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </main>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}