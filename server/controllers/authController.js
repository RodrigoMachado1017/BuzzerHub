const supabase = require('../config/supabase.js');

exports.register = async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    // O Supabase já gerencia a criação segura do usuário com hash de senha
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nome } // Salvando o nome nos metadados do usuário
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: 'Apicultor cadastrado com sucesso! 🐝', user: data.user });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // É esse comando aqui que verifica o usuário e a senha no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error; // Se a senha/email tiver errado, ele pula pro catch
    }

    res.status(200).json({ session: data.session });
  } catch (error) {
    console.error("Erro no login:", error);
    // É esse status 401 que está aparecendo no seu console do navegador!
    res.status(401).json({ error: 'Email ou senha incorretos.' });
  }
};