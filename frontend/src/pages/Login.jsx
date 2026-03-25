import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(''); // Estado para exibir erros na tela
  const [carregando, setCarregando] = useState(false); // Estado para o botão de login

  // Trazendo a função login do nosso contexto e o hook de navegação
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Fazendo a chamada para o nosso Backend Node.js
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso! Salvamos os dados no contexto (e localStorage)
        // O Supabase retorna os dados do usuário dentro de data.session.user
        login(data.session.user, data.session.access_token);
        
        // Redireciona para o Dashboard (que vai cair direto em /app/anotacoes)
        navigate('/app');
      } else {
        // Se a API retornar erro (ex: senha incorreta)
        setErro(data.error || 'Erro ao realizar login.');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro('Erro de conexão com o servidor das abelhas. 🐝');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-center items-center font-sans">
      
      {/* Logo e Título */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="text-4xl mb-2">🐝</div> 
        <h1 className="text-3xl font-bold text-gray-800">Buzzer</h1>
      </div>

      {/* Card de Login */}
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Mensagem de Erro (se houver) */}
          {erro && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
              {erro}
            </div>
          )}

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
            disabled={carregando}
            className={`w-full bg-[#EAAA40] hover:bg-[#d49630] text-white font-bold py-2 px-4 rounded transition duration-200 ${carregando ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {carregando ? 'Entrando...' : 'Log in'}
          </button>

          <div className="text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-800 underline">Forgot password?</a>
          </div>
        </form>
      </div>

      {/* Link de Cadastro */}
      <div className="mt-6 text-sm text-gray-600">
        Don't have an account? <Link to="/cadastro" className="font-bold text-gray-800 hover:underline">Sign up</Link>
      </div>

    </div>
  );
}