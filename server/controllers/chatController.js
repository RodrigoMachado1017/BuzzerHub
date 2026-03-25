// controllers/chatController.js
exports.askAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensagens inválido.' });
    }

    // Fazemos a chamada para a Groq escondendo a chave no servidor
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages, // Recebemos todo o contexto do frontend
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Detalhe do erro da Groq:", errData);
      throw new Error(errData.error?.message || 'Erro na comunicação com a IA.');
    }

    const data = await response.json();
    
    // Devolvemos apenas o texto da resposta para o React
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Erro no servidor do Chat:', error.message);
    return res.status(500).json({ error: 'Erro ao gerar resposta da IA.' });
  }
};