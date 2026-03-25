import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import DashboardLayout from './pages/DashboardLayout';
import Anotacoes from './pages/Anotacoes';
import Arquivos from './pages/Arquivos';
import Chat from './pages/Chat';

// Contexto e Proteção de Rota
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas do Dashboard (Agora Privadas/Protegidas) */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* O Navigate redireciona /app direto para /app/anotacoes, atualizando a URL */}
            <Route index element={<Navigate to="anotacoes" replace />} />
            <Route path="anotacoes" element={<Anotacoes />} />
            <Route path="arquivos" element={<Arquivos />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;