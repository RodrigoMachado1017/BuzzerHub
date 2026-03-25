import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Cadastro() {
  // Unimos todos os estados necessários
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Ferramentas de navegação e contexto
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    // Validação básica
    if (password !== confirmPassword) {
      return setErro('As senhas não coincidem. As abelhas estão confusas! 🐝');
    }

    setCarregando(true);

    try {
      // Chamando a rota de registro no nosso Node.js, agora enviando o "nome" também!
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Se der sucesso e o Supabase devolver a sessão, loga e manda pro painel
        if (data.session) {
          login(data.session.user, data.session.access_token);
          navigate('/app');
        } else {
          // Caso seu Supabase exija confirmação de e-mail
          setErro('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
          // Limpa os campos após o sucesso (opcional)
          setNome(''); setEmail(''); setPassword(''); setConfirmPassword('');
        }
      } else {
        setErro(data.error || 'Erro ao realizar o cadastro.');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro('Erro de conexão com a colmeia (Servidor).');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-center items-center font-sans py-10">
      
      {/* Logo e Título (do primeiro código) */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="text-4xl mb-2">🐝</div> 
        <h1 className="text-3xl font-bold text-gray-800">Buzzer</h1>
        <p className="text-gray-500 text-sm mt-1">Crie sua conta no apiário digital</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
        <form onSubmit={handleCadastro} className="space-y-4">
          
          {/* Caixa de mensagens de Erro/Sucesso (do segundo código) */}
          {erro && (
            <div className={`p-3 rounded text-sm text-center ${erro.includes('realizado') || erro.includes('Verifique') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {erro}
            </div>
          )}

          {/* Campo Nome */}
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

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
              minLength="6"
            />
          </div>

          {/* Campo Confirme Senha */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Senha</label>
            <input 
              type="password" 
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              required
              minLength="6"
            />
          </div>

          {/* Botão de Submit com efeito de carregamento */}
          <button 
            type="submit" 
            disabled={carregando}
            className={`w-full bg-[#EAAA40] hover:bg-[#d49630] text-white font-bold py-2 px-4 rounded transition duration-200 mt-4 ${carregando ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Já tem uma conta? <Link to="/" className="font-bold text-gray-800 hover:underline">Faça login</Link>
      </div>

    </div>
  );
}