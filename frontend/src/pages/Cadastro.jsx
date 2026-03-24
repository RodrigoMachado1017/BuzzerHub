import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    // Futuramente: Chamada para o backend Node/Supabase aqui
    console.log("Tentando cadastrar:", { nome, email, password });
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-center items-center font-sans py-10">
      
      {/* Logo e Título */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="text-4xl mb-2">🐝</div> 
        <h1 className="text-3xl font-bold text-gray-800">Buzzer</h1>
        <p className="text-gray-500 text-sm mt-1">Crie sua conta no apiário digital</p>
      </div>

      {/* Card de Cadastro */}
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
        <form onSubmit={handleCadastro} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
            <input 
              type="text" 
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirme a Senha</label>
            <input 
              type="password" 
              placeholder="Confirme a Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#EAAA40] hover:bg-[#d49630] text-white font-bold py-2 px-4 rounded transition duration-200 mt-4"
          >
            Cadastrar
          </button>
        </form>
      </div>

      {/* Link de volta para o Login */}
      <div className="mt-6 text-sm text-gray-600">
        Já tem uma conta? <Link to="/" className="font-bold text-gray-800 hover:underline">Log in</Link>
      </div>

    </div>
  );
}