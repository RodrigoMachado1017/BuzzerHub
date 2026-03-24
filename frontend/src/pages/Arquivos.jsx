import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Arquivos() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('medio'); // 'detalhe', 'medio', 'grande'

  const BUCKET_NAME = 'BuzzerFilles'; 

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Erro ao buscar arquivos:', error);
    else setFiles(data);
    
    setLoading(false);
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueFileName);

      const newFileObj = {
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size
      };

      const { data: dbData, error: dbError } = await supabase
        .from('files')
        .insert([newFileObj])
        .select();

      if (dbError) throw dbError;

      setFiles([dbData[0], ...files]);

    } catch (error) {
      console.error('Erro no upload:', error.message);
      alert('Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id, fileUrl) => {
    if (!window.confirm("Deseja apagar este arquivo permanentemente?")) return;

    try {
      const pathParts = fileUrl.split(`/${BUCKET_NAME}/`);
      const storagePath = pathParts.length > 1 ? pathParts[1] : null;

      if (storagePath) {
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      }
      
      await supabase.from('files').delete().eq('id', id);
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const mapFileToVisualType = (mimeType) => {
    if (!mimeType) return { text: 'Arquivo', icon: '📁' };
    if (mimeType.includes('image')) return { text: 'Imagem', icon: '🖼️' };
    if (mimeType.includes('pdf')) return { text: 'PDF', icon: '📄' };
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return { text: 'Planilha', icon: '📊' };
    if (mimeType.includes('word') || mimeType.includes('officedocument.word')) return { text: 'Documento', icon: '📝' };
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { text: 'Apresentação', icon: '📉' };
    if (mimeType.includes('video')) return { text: 'Vídeo', icon: '🎬' };
    if (mimeType.includes('text')) return { text: 'Texto', icon: '🗒️' };
    return { text: 'Arquivo', icon: '📁' };
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString();
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-[#1E1F22] gap-4">
      <div className="w-12 h-12 border-4 border-[#EAAA40] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#EAAA40] font-bold text-xs tracking-[0.3em]">CARREGANDO ARQUIVOS...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#1E1F22] text-gray-200 p-10 overflow-y-auto">
      
      {/* HEADER E CONTROLES */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 border-b border-gray-800 pb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">ARQUIVOS DA COLMEIA</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-bold">Documentos, Fotos e Laudos (Nuvem)</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          
          {/* BOTÕES DE VISUALIZAÇÃO */}
          <div className="flex bg-[#1B1C1F] p-1 rounded-xl border border-gray-800 shadow-inner w-full sm:w-auto">
            {['detalhe', 'medio', 'grande'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300
                  ${viewMode === mode 
                    ? 'bg-[#2A2B30] text-[#EAAA40] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-300 hover:bg-[#232429]/50'}
                `}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* BOTÃO DE UPLOAD */}
          <div className="relative group w-full sm:w-auto cursor-pointer">
            <input type="file" onChange={handleFileUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"/>
            <button disabled={uploading} className={`w-full sm:w-auto px-8 py-3 font-black rounded-xl shadow-lg transition-all duration-300 uppercase text-xs tracking-widest border-b-4
                ${uploading ? 'bg-gray-700 text-gray-400 border-gray-900 cursor-not-allowed' : 'bg-[#EAAA40] text-[#1A1814] border-[#8B7336] group-hover:bg-[#f0ba59] group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(234,170,64,0.3)] group-active:translate-y-0 group-active:border-b-0 group-active:mt-1'}
              `}>
              {uploading ? 'Enviando pra Nuvem...' : 'Fazer Upload 📁'}
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DOS ARQUIVOS */}
      {files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50 animated-fadeIn">
          <span className="text-8xl mb-6">🗂️</span>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nenhum arquivo armazenado</p>
        </div>
      ) : viewMode === 'detalhe' ? (
        
        /* MODO: DETALHE (Tabela) */
        <div key={`view-${viewMode}`} className="animated-fadeIn bg-[#1B1C1F] rounded-2xl border border-gray-800 p-2 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest w-2/5">Nome</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest w-1/5">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest w-1/5">Tamanho</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest w-1/5">Modificado</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-600 uppercase tracking-widest w-10 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const visual = mapFileToVisualType(file.file_type);
                return (
                  <tr key={file.id} className="border-b border-gray-800/50 hover:bg-[#232429]/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-[#1A1C1F] rounded-lg border border-gray-800/50 flex-shrink-0">
                        {visual.icon}
                      </span>
                      <span className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-xs" title={file.file_name}>
                        {file.file_name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-gray-400">{visual.text}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-[#EAAA40] bg-[#EAAA40]/10 px-2 py-1 rounded">
                        {formatBytes(file.file_size)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-gray-500">
                        {formatRelativeDate(file.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={file.file_url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-900/80 backdrop-blur text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="Abrir">
                          👁️
                        </a>
                        <button onClick={() => deleteFile(file.id, file.file_url)} className="w-8 h-8 flex items-center justify-center bg-gray-900/80 backdrop-blur text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg" title="Deletar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (
        
        /* MODO: MÉDIO E GRANDE (Grid Cards) */
        <div key={`view-${viewMode}`} className={`grid gap-6 content-start animated-fadeIn ${viewMode === 'grande' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
          {files.map((file) => (
            /* REMOVIDO: hover:border-[#EAAA40]/50 */
            <div key={file.id} className="bg-[#232429] rounded-2xl p-5 border border-gray-800 transition-all group relative flex flex-col h-64 transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="h-32 bg-[#1A1C1F] rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-gray-800/50 flex-shrink-0">
                {file.file_type?.includes('image') ? (
                  <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{mapFileToVisualType(file.file_type).icon}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className={`font-bold text-gray-200 truncate ${viewMode === 'grande' ? 'text-lg' : 'text-sm'}`} title={file.file_name}>{file.file_name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{new Date(file.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] font-bold text-[#EAAA40] bg-[#EAAA40]/10 px-2 py-1 rounded w-max mt-2">{formatBytes(file.file_size)}</span>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={file.file_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-900/80 backdrop-blur text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg">👁️</a>
                <button onClick={() => deleteFile(file.id, file.file_url)} className="w-10 h-10 flex items-center justify-center bg-gray-900/80 backdrop-blur text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}