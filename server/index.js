const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Teste
app.get('/', (req, res) => {
  res.send('Buzzer API Rodando! 🐝');
});

// Aqui entrarão nossas rotas de Notas, Arquivos e Chat
// app.use('/api/notes', require('./routes/notes'));

app.listen(PORT, () => {
  console.log(`Servidor zumbindo na porta ${PORT}`);
});