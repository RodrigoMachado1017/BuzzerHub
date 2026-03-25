const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Importando o logger
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const chatRoutes = require('./routes/chat'); // Importe a rota

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Gera logs coloridos e bonitinhos no console (ex: POST /api/auth/login 200)

// Rotas Base
app.get('/', (req, res) => {
  res.send('Buzzer API Rodando! 🐝');
});

// Rotas da Aplicação
app.use('/api/auth', authRoutes);
// Futuras rotas:
// app.use('/api/notes', require('./routes/notes'));
// app.use('/api/files', require('./routes/files'));
// app.use('/api/chat', require('./routes/chat'));
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); // Adicione esta linha!

app.listen(PORT, () => {
  console.log(`🐝 Servidor zumbindo na porta ${PORT}`);
});
