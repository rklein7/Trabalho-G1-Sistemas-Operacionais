const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Erro ao conectar ao MongoDB:', err));

const Message = mongoose.model('Message', {
  user: String,
  text: String,
  timestamp: Date
});

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

app.get("/api/messages", async (req, res) => {
  const messages = await Message.find()
    .sort({ timestamp: -1 }) // do mais recente ao mais antigo
    .limit(30);               // pegar só os 30 últimos
  res.json(messages.reverse()); // reverte para exibir do mais antigo ao mais novo
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Mensagem deletada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar mensagem" });
  }
});


io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('chat message', async ({ user, text }) => {
    const msg = new Message({ user, text, timestamp: new Date() });
    await msg.save();
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
