import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Anotacoes() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CARREGAR NOTAS DO SUPABASE
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notas:', error);
    } else {
      setNotes(data);
      if (data.length > 0) setActiveNoteId(data[0].id);
    }
    setLoading(false);
  }

  // 2. CRIAR NOVA NOTA (Default: estilo 'p')
  const addNote = async () => {
    const newNote = {
      title: "Nova Anotação",
      content: "",
      style: "p"
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select();

    if (error) {
      console.error('Erro ao criar nota:', error);
    } else {
      setNotes([data[0], ...notes]);
      setActiveNoteId(data[0].id);
    }
  };

  // 3. ATUALIZAR NOTA
  const updateNote = async (field, value) => {
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) return { ...note, [field]: value };
      return note;
    });
    setNotes(updatedNotes);

    const { error } = await supabase
      .from('notes')
      .update({ [field]: value })
      .eq('id', activeNoteId);

    if (error) console.error('Erro ao salvar no banco:', error);
  };

  // 4. DELETAR NOTA
  const deleteNote = async (id, e) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
    } else {
      const filtered = notes.filter(n => n.id !== id);
      setNotes(filtered);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0]?.id || null);
      }
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-[#1E1F22] gap-4">
      <div className="w-12 h-12 border-4 border-[#EAAA40] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#EAAA40] font-bold text-xs tracking-[0.3em]">SINCRONIZANDO COLMEIA...</p>
    </div>
  );

  return (
    <div className="flex h-full bg-[#1E1F22] text-gray-200 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-gray-700 flex flex-col bg-[#1B1C1F] flex-shrink-0">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1B1C1F] z-10">
          <h2 className="text-[#EAAA40] font-bold uppercase tracking-widest text-[10px]">Anotações Cloud</h2>
          <button onClick={addNote} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-[#8B7336] hover:text-white transition-all">＋</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-5 border-b border-gray-800/60 cursor-pointer transition-all group relative
                ${activeNoteId === note.id ? 'bg-[#2A2B30] border-l-4 border-l-[#EAAA40]' : 'hover:bg-[#232429] border-l-4 border-l-transparent'}
              `}
            >
              <h3 className={`text-sm font-bold truncate ${activeNoteId === note.id ? 'text-white' : 'text-gray-300'}`}>
                {note.title || "Sem título"}
              </h3>
              <p className="text-[12px] text-gray-500 truncate mt-1">{note.content || "Nenhum conteúdo..."}</p>
              <button 
                onClick={(e) => deleteNote(note.id, e)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* EDITOR PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-[#1E1F22]">
        {notes.length > 0 && activeNote ? (
          <>
            {/* TOOLBAR */}
            <div className="px-10 py-4 border-b border-gray-800 bg-[#232429] flex justify-between items-center h-[65px] flex-shrink-0">
               <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-4">Formatação:</span>
                  
                  {['p', 'h1', 'h2', 'h3'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => updateNote('style', s)}
                      className={`w-10 h-8 flex items-center justify-center text-[12px] font-black rounded transition-all uppercase
                        ${(activeNote.style || 'p') === s 
                          ? 'bg-[#EAAA40] text-[#1A1814] shadow-lg scale-110' 
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'}
                      `}
                    >
                      {s}
                    </button>
                  ))}
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Conectado</span>
                 </div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]"></div>
               </div>
            </div>

            {/* ÁREA DE TEXTO */}
            <div className="flex-1 p-12 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                <input 
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote('title', e.target.value)}
                  className="w-full bg-transparent text-5xl font-black text-white outline-none border-none placeholder:text-gray-600 tracking-tighter"
                  placeholder="Título..."
                />
                
                <textarea 
                  value={activeNote.content}
                  onChange={(e) => updateNote('content', e.target.value)}
                  className={`w-full h-[60vh] bg-transparent leading-relaxed outline-none resize-none border-none placeholder:text-gray-600 transition-all duration-300
                    ${activeNote.style === 'h1' ? 'text-4xl font-black text-white' : ''}
                    ${activeNote.style === 'h2' ? 'text-2xl font-bold text-gray-100' : ''}
                    ${activeNote.style === 'h3' ? 'text-xl font-semibold text-gray-200' : ''}
                    ${(!activeNote.style || activeNote.style === 'p') ? 'text-lg font-medium text-gray-300' : ''}
                  `}
                  placeholder="Zumbindo pensamentos no papel..."
                />
              </div>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#1E1F22] p-20">
            <div className="relative mb-10">
                <span className="text-[120px] opacity-10">📂</span>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl">🐝</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">NENHUMA NOTA ENCONTRADA</h2>
            <p className="text-gray-400 mb-10 text-center max-w-sm uppercase text-[11px] font-bold tracking-[0.1em] leading-loose">
              Seu apiário digital está pronto para novas anotações sincronizadas na nuvem.
            </p>
            <button 
              onClick={addNote} 
              className="px-10 py-4 bg-[#EAAA40] text-[#1A1814] font-black rounded-xl shadow-[0_10px_30px_rgba(234,170,64,0.2)] hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-[0.2em] border-b-4 border-[#8B7336]"
            >
              Iniciar Nova Nota
            </button>
          </div>
        )}
      </main>
    </div>
  );
}