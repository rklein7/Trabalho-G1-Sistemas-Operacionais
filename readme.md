# 💬 Chat em Tempo Real - Projeto de Docker 🐳 

Este projeto consiste em um **sistema de chat em tempo real**, com persistência de dados, desenvolvido para a disciplina de **Sistemas Operacionais**.

Utilizamos **Node.js**, **Socket.io** e **MariaDB**, tudo integrado com **Docker Compose** para garantir portabilidade, isolamento e facilidade de execução.

---

## 🏗️ Arquitetura da Solução

A arquitetura é composta por dois principais serviços:

1. **Backend** (`Node.js` + `Socket.io`):
   - API REST para gerenciamento de mensagens.
   - Comunicação em tempo real via WebSockets.
   - Conexão com o banco de dados para persistência.

2. **Banco de Dados** (`MariaDB`):
   - Armazena as mensagens enviadas.
   - Volume persistente para manter os dados mesmo após reiniciar os containers.

**Comunicação:**

- O backend e o banco interagem via rede `chatnet` criada pelo Docker.
- O frontend (interface web) está embutido no backend e serve os arquivos estáticos.

---

## 🖥️ Tecnologias Utilizadas

- **Node.js** — servidor backend.
- **Socket.io** — comunicação em tempo real.
- **Express.js** — roteamento e APIs.
- **MariaDB** — persistência de dados.
- **Docker** — containerização.
- **Docker Compose** — orquestração de serviços.

---

## ✨ Funcionalidades Implementadas

✅ Envio de mensagens.  
✅ Recebimento em tempo real.  
✅ Exclusão de mensagens com confirmação.  
✅ Persistência das mensagens no banco de dados.  
✅ Limitação para exibir as **últimas 30 mensagens**.  
✅ Interface estilizada e responsiva.

---

## 🛠️ Como Executar o Projeto
✅ Pré-requisitos
Sistema Operacional (Windows ou Linux)

Docker e Docker Compose instalados

## ✅ Passos:
### Clone o repositório:

git clone https://github.com/rklein7/Trabalho-G1-Sistemas-Operacionais.git

cd Trabalho-G1-Sistemas-Operacionais

### Execute o Docker Compose:

docker compose up --build

### Acesse a aplicação:

No navegador, abra:
http://localhost:3000

### Para finalizar o container:

docker compose down

---

## 🧑‍💻  Integrantes:

- **Eduardo da Silva Sichelero** 
- **Rafael Augusto Klein**
- **Vitor Augusto Feil Quadros** 