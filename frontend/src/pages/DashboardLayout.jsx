import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  const menuClass = ({ isActive }) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 border-l-4";
    const interactionState = "hover:scale-105 hover:bg-[#4A3F24] hover:text-gray-100 hover:shadow-md";

    if (isActive) {
      return `${baseClass} bg-[#363022] text-[#EAAA40] border-[#EAAA40] font-medium shadow-sm`;
    } else {
      return `${baseClass} text-gray-400 border-transparent ${interactionState}`;
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1F22] font-sans">
      
      {/* Menu Lateral com Gradiente */}
      <aside className="w-64 bg-gradient-to-b from-[#232429] to-[#232429] text-white flex flex-col border-r border-[#4A3F24] z-10 shadow-2xl">
        
        {/* Container para CENTRALIZAR o elemento compactado da Logo */}
        <div className="w-full flex justify-center mt-6">
            {/* Logo area: Compactada (w-fit), Zero Laterais Sobrando e agora com CINZA CLARO */}
            {/* Fundo Cinza (bg-[##232429]) e Borda Cinza Média */}
            <div className="p-2 flex items-center gap-1 rounded-xl bg-[#2c2d33] shadow-xl border-b-[3px] border-[#2c2d33] flex-shrink-0 cursor-default w-fit">
              <img src="/buzzer_bee_minimalist.png" alt="Buzzer Bee" className="w-8 h-8 object-contain transition-transform duration-200" />
              <span className="text-xl font-bold text-[#EAAA40] tracking-tight uppercase">Buzzer Hub</span>
            </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 px-4 space-y-3 mt-8">
          <NavLink to="/app/anotacoes" className={menuClass}>
            <span className="text-xl">📄</span> Anotações
          </NavLink>
          
          <NavLink to="/app/arquivos" className={menuClass}>
            <span className="text-xl">📁</span> Arquivos
          </NavLink>
          
          <NavLink to="/app/chat" className={menuClass}>
            <span className="text-xl">💬</span> Chat
          </NavLink>
        </nav>

        {/* Rodapé do Menu */}
        <div className="p-4 border-t border-[#4A3F24] mt-auto">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-md transition-all duration-200 hover:scale-105 hover:bg-[#4A3F24] hover:text-white">
            <span className="text-xl">🚪</span> Sair
          </NavLink>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 overflow-hidden bg-[#1E1F22]">
        <Outlet /> 
      </main>

    </div>
  );
}