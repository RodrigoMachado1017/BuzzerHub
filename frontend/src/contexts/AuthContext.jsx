import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao recarregar a página, verifica se o usuário já estava logado
    const token = localStorage.getItem('@Buzzer:token');
    const userData = localStorage.getItem('@Buzzer:user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Função que chamaremos na tela de Login após a resposta do Node.js
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('@Buzzer:user', JSON.stringify(userData));
    localStorage.setItem('@Buzzer:token', token);
  };

  // Função para deslogar (você pode colocar num botão de "Sair" no menu lateral)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Buzzer:user');
    localStorage.removeItem('@Buzzer:token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};