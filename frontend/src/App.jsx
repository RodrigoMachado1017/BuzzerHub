import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import DashboardLayout from './pages/DashboardLayout';
import Anotacoes from './pages/Anotacoes';
import Arquivos from './pages/Arquivos';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas do Dashboard (Privadas depois) */}
        <Route path="/app" element={<DashboardLayout />}>
          {/* O index faz a rota "/app" redirecionar direto para "/app/anotacoes" */}
          <Route index element={<Anotacoes />} />
          <Route path="anotacoes" element={<Anotacoes />} />
          <Route path="arquivos" element={<Arquivos />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;