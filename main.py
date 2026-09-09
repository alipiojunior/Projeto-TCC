from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("arquivos_salvos", exist_ok=True)

engine = create_engine("sqlite:///./projetos_academicos.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Projeto(Base):
    __tablename__ = "projetos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    tipo = Column(String)
    descricao = Column(Text)
    orientador = Column(String, nullable=True)

class Tarefa(Base):
    __tablename__ = "tarefas"
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"))
    titulo = Column(String)
    status = Column(String, default="A Fazer")
    caminho_arquivo = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def obter_banco_dados():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjetoCriar(BaseModel):
    titulo: str
    tipo: str
    descricao: str
    orientador: str | None = None

class TarefaCriar(BaseModel):
    projeto_id: int
    titulo: str
    status: str = "A Fazer"

@app.post("/projetos/")
def criar_projeto(projeto: ProjetoCriar, db: Session = Depends(obter_banco_dados)):
    novo_projeto = Projeto(**projeto.dict())
    db.add(novo_projeto)
    db.commit()
    db.refresh(novo_projeto)
    return novo_projeto

@app.get("/projetos/")
def listar_projetos(db: Session = Depends(obter_banco_dados)):
    return db.query(Projeto).all()

@app.post("/tarefas/")
def criar_tarefa(tarefa: TarefaCriar, db: Session = Depends(obter_banco_dados)):
    nova_tarefa = Tarefa(**tarefa.dict())
    db.add(nova_tarefa)
    db.commit()
    db.refresh(nova_tarefa)
    return nova_tarefa

@app.post("/tarefas/{tarefa_id}/upload")
def upload_arquivo_tarefa(tarefa_id: int, arquivo: UploadFile = File(...), db: Session = Depends(obter_banco_dados)):
    caminho_salvar = f"arquivos_salvos/{arquivo.filename}"
    
    with open(caminho_salvar, "wb") as buffer:
        shutil.copyfileobj(arquivo.file, buffer)
    
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    tarefa.caminho_arquivo = caminho_salvar
    db.commit()
    
    return {"mensagem": "Upload concluído", "caminho_arquivo": caminho_salvar}