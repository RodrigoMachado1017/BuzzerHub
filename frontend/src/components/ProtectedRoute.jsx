import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Uma telinha de carregamento enquanto verificamos o localStorage
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] font-bold text-gray-700">Carregando o apiário... 🐝</div>;
  }

  if (!user) {
    // Se não estiver logado, redireciona para a página Home/Login
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, permite renderizar o conteúdo (o DashboardLayout)
  return children;
}