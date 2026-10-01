# Sistema Web de Gerenciamento de Projetos Acadêmicos

Plataforma desenvolvida para auxiliar estudantes universitários na organização de TCCs, Monografias e Projetos de Extensão. O sistema permite o controle de tarefas, estruturação de equipes multidisciplinares e, futuramente, compartilhamento centralizado de arquivos e cronogramas.

## 🚀 Funcionalidades Atuais (MVP)
* **Cadastro de Projetos:** Criação de projetos definindo título, tipo, descrição e orientador principal.
* **Gestão de Equipes Multidisciplinares:** Adição de múltiplos membros ao mesmo projeto, permitindo registrar qual cadeira e qual professor cada aluno responde individualmente.
* **Dashboard Dinâmico:** Visualização em cards de todos os projetos ativos da equipe.
* **Telas de Autenticação (Visual):** Estrutura de interface para login e registro de estudantes e professores.

## 🛠️ Tecnologias Utilizadas
* **Backend:** Python + FastAPI
* **Banco de Dados:** SQLite + SQLAlchemy (ORM)
* **Frontend:** React.js (Single Page Application)

## ⚙️ Como rodar o projeto localmente

O projeto é dividido em duas partes (Cliente e Servidor) que precisam rodar simultaneamente.

### 1. Configurando o Backend (API)
Abra um terminal na pasta raiz do projeto e execute:

```bash
# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual (Windows)
.\venv\Scripts\activate

# Instale as dependências
pip install fastapi uvicorn sqlalchemy pydantic python-multipart

# Inicie o servidor
uvicorn main:app --reload