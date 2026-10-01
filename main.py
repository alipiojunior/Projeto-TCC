from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
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
    nome_equipe = Column(String, nullable=True)
    
    membros = relationship("Membro", back_populates="projeto", cascade="all, delete-orphan")
    tarefas = relationship("Tarefa", back_populates="projeto", cascade="all, delete-orphan")

class Membro(Base):
    __tablename__ = "membros"
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"))
    nome = Column(String)
    disciplinas = Column(String) 
    professor = Column(String, nullable=True) 
    
    projeto = relationship("Projeto", back_populates="membros")

class Tarefa(Base):
    __tablename__ = "tarefas"
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"))
    titulo = Column(String)
    status = Column(String, default="A Fazer")
    caminho_arquivo = Column(String, nullable=True)
    
    projeto = relationship("Projeto", back_populates="tarefas")

Base.metadata.create_all(bind=engine)

def obter_banco_dados():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class MembroCriar(BaseModel):
    nome: str
    disciplinas: str
    professor: Optional[str] = None

class ProjetoCriar(BaseModel):
    titulo: str
    tipo: str
    descricao: str
    orientador: Optional[str] = None
    nome_equipe: Optional[str] = None
    membros: List[MembroCriar] = []

class MembroResponse(BaseModel):
    id: int
    nome: str
    disciplinas: str
    professor: Optional[str]
    class Config:
        orm_mode = True

class ProjetoResponse(BaseModel):
    id: int
    titulo: str
    tipo: str
    descricao: str
    orientador: Optional[str]
    nome_equipe: Optional[str]
    membros: List[MembroResponse] = []
    class Config:
        orm_mode = True

class TarefaCriar(BaseModel):
    projeto_id: int
    titulo: str
    status: str = "A Fazer"

# Rotas
@app.post("/projetos/", response_model=ProjetoResponse)
def criar_projeto(projeto: ProjetoCriar, db: Session = Depends(obter_banco_dados)):
    novo_projeto = Projeto(
        titulo=projeto.titulo,
        tipo=projeto.tipo,
        descricao=projeto.descricao,
        orientador=projeto.orientador,
        nome_equipe=projeto.nome_equipe
    )
    db.add(novo_projeto)
    db.commit()
    db.refresh(novo_projeto)
    
    for m in projeto.membros:
        novo_membro = Membro(projeto_id=novo_projeto.id, nome=m.nome, disciplinas=m.disciplinas, professor=m.professor)
        db.add(novo_membro)
        
    db.commit()
    db.refresh(novo_projeto)
    return novo_projeto

@app.get("/projetos/", response_model=List[ProjetoResponse])
def listar_projetos(db: Session = Depends(obter_banco_dados)):
    return db.query(Projeto).all()

@app.delete("/projetos/{projeto_id}")
def deletar_projeto(projeto_id: int, db: Session = Depends(obter_banco_dados)):
    projeto = db.query(Projeto).filter(Projeto.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    db.delete(projeto)
    db.commit()
    return {"mensagem": "Projeto excluído com sucesso"}

@app.put("/projetos/{projeto_id}", response_model=ProjetoResponse)
def editar_projeto(projeto_id: int, projeto_atualizado: ProjetoCriar, db: Session = Depends(obter_banco_dados)):
    projeto = db.query(Projeto).filter(Projeto.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    projeto.titulo = projeto_atualizado.titulo
    projeto.tipo = projeto_atualizado.tipo
    projeto.descricao = projeto_atualizado.descricao
    projeto.orientador = projeto_atualizado.orientador
    projeto.nome_equipe = projeto_atualizado.nome_equipe
    
    db.query(Membro).filter(Membro.projeto_id == projeto_id).delete()
    for m in projeto_atualizado.membros:
        novo_membro = Membro(projeto_id=projeto_id, nome=m.nome, disciplinas=m.disciplinas, professor=m.professor)
        db.add(novo_membro)
        
    db.commit()
    db.refresh(projeto)
    return projeto

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