import React, { useState } from 'react';  
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // Aqui faremos a chamada para o nosso Backend Node.js
    console.log("Tentando logar com:", email, password);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-center items-center font-sans">
      
      {/* Logo e Título */}
      <div className="mb-8 text-center flex flex-col items-center">
        {/* Substitua por um <img> com sua logo de abelha real */}
        <div className="text-4xl mb-2">🐝</div> 
        <h1 className="text-3xl font-bold text-gray-800">Buzzer</h1>
      </div>

      {/* Card de Login */}
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
        <form onSubmit={handleLogin} className="space-y-6">
          
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
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#EAAA40] hover:bg-[#d49630] text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Log in
          </button>

          <div className="text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-800 underline">Forgot password?</a>
          </div>
        </form>
      </div>

      {/* Link de Cadastro */}
      <div className="mt-6 text-sm text-gray-600">
        Don't have an account? <Link to="/cadastro">Sign up</Link>
        {/* Se usar React Router: <Link to="/cadastro" className="font-bold text-gray-800 hover:underline">Sign up</Link> */}
      </div>

    </div>
  );
}