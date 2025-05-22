const express = require('express');
const http = require('http');
const mariadb = require('mariadb');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'senha_root',
  database: process.env.DB_NAME || 'chatdb',
  connectionLimit: 5
});

(async () => {
  const conn = await pool.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.release();
})();

app.use(express.static('public'));
app.use(express.json());

app.get('/api/messages', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const messages = await conn.query(`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT 30
    `);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id = parseInt(req.params.id);
    const result = await conn.query('DELETE FROM messages WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Mensagem deletada com sucesso" });
    } else {
      res.status(404).json({ error: "Mensagem não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar mensagem" });
  } finally {
    conn.release();
  }
});

app.delete('/api/messages', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM messages');
    io.emit('clear messages');
    res.status(200).json({ message: "Todas as mensagens foram apagadas com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar mensagens" });
  } finally {
    conn.release();
  }
});
app.put('/api/messages/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id = parseInt(req.params.id);
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: "Texto da mensagem é obrigatório" });
      return;
    }

    const result = await conn.query('UPDATE messages SET text = ? WHERE id = ?', [text, id]);

    if (result.affectedRows > 0) {
      const [updatedMessage] = await conn.query('SELECT * FROM messages WHERE id = ?', [id]);
      io.emit('edit message', updatedMessage);
      res.status(200).json(updatedMessage);
    } else {
      res.status(404).json({ error: "Mensagem não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar mensagem" });
  } finally {
    conn.release();
  }
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('chat message', async ({ user, text }) => {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        'INSERT INTO messages (user, text) VALUES (?, ?)',
        [user, text]
      );
      const [newMessage] = await conn.query(
        'SELECT * FROM messages WHERE id = ?',
        [result.insertId]
      );
      io.emit('chat message', {
        _id: newMessage.id,
        user: newMessage.user,
        text: newMessage.text,
        timestamp: newMessage.timestamp
      });
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    } finally {
      conn.release();
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
