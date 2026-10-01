import React, { useState, useEffect } from 'react';

function App() {
  const [telaAtual, setTelaAtual] = useState('login');
  const [projetos, setProjetos] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idProjetoEditando, setIdProjetoEditando] = useState(null);
  
  const [formularioProjeto, setFormularioProjeto] = useState({
    titulo: '',
    tipo: '',
    descricao: '',
    orientador: '',
    nome_equipe: '',
    membros: []
  });

  useEffect(() => {
    if (telaAtual === 'dashboard') buscarProjetos();
  }, [telaAtual]);

  const buscarProjetos = async () => {
    try {
      const resposta = await fetch('http://localhost:8000/projetos/');
      if (resposta.ok) {
        const dados = await resposta.json();
        setProjetos(dados);
      }
    } catch (erro) {
      console.error("Erro ao buscar projetos:", erro);
    }
  };

  const lidarComMudanca = (evento) => {
    const { name, value } = evento.target;
    setFormularioProjeto({ ...formularioProjeto, [name]: value });
  };

  const adicionarMembro = () => {
    setFormularioProjeto({
      ...formularioProjeto,
      membros: [...formularioProjeto.membros, { nome: '', disciplinas: '', professor: '' }]
    });
  };

  const atualizarMembro = (index, campo, valor) => {
    const novosMembros = [...formularioProjeto.membros];
    novosMembros[index][campo] = valor;
    setFormularioProjeto({ ...formularioProjeto, membros: novosMembros });
  };

  const removerMembro = (index) => {
    const novosMembros = formularioProjeto.membros.filter((_, i) => i !== index);
    setFormularioProjeto({ ...formularioProjeto, membros: novosMembros });
  };

  const enviarProjeto = async (evento) => {
    evento.preventDefault();
    try {
      if (modoEdicao) {
        await fetch(`http://localhost:8000/projetos/${idProjetoEditando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formularioProjeto),
        });
        setModoEdicao(false);
        setIdProjetoEditando(null);
      } else {
        await fetch('http://localhost:8000/projetos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formularioProjeto),
        });
      }
      setFormularioProjeto({ titulo: '', tipo: '', descricao: '', orientador: '', nome_equipe: '', membros: [] });
      buscarProjetos();
    } catch (erro) {
      console.error("Erro ao salvar projeto:", erro);
    }
  };

  const excluirProjeto = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
      try {
        await fetch(`http://localhost:8000/projetos/${id}`, { method: 'DELETE' });
        buscarProjetos();
      } catch (erro) {
        console.error("Erro ao excluir projeto:", erro);
      }
    }
  };

  const iniciarEdicao = (projeto) => {
    setModoEdicao(true);
    setIdProjetoEditando(projeto.id);
    setFormularioProjeto({
      titulo: projeto.titulo,
      tipo: projeto.tipo,
      descricao: projeto.descricao,
      orientador: projeto.orientador || '',
      nome_equipe: projeto.nome_equipe || '',
      membros: projeto.membros || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setIdProjetoEditando(null);
    setFormularioProjeto({ titulo: '', tipo: '', descricao: '', orientador: '', nome_equipe: '', membros: [] });
  };

  if (telaAtual === 'login') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6fa' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Bem-vindo</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Faça login para acessar seus projetos</p>
          <form onSubmit={(e) => { e.preventDefault(); setTelaAtual('dashboard'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="E-mail acadêmico" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Senha" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
          </form>
          <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
            Não tem uma conta? <span style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setTelaAtual('registro')}>Cadastre-se</span>
          </p>
        </div>
      </div>
    );
  }

  if (telaAtual === 'registro') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6fa' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Criar Conta</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Cadastre-se como Estudante ou Professor</p>
          <form onSubmit={(e) => { e.preventDefault(); setTelaAtual('dashboard'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Nome completo" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="E-mail acadêmico" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <select style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: 'white' }}>
              <option value="estudante">Estudante</option>
              <option value="professor">Professor/Orientador</option>
            </select>
            <input type="password" placeholder="Crie uma senha" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Finalizar Cadastro</button>
          </form>
          <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
            Já tem uma conta? <span style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setTelaAtual('login')}>Faça login</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#333' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: '#2c3e50', fontSize: '2.5rem', margin: '0 0 10px 0' }}>Plataforma de Projetos</h1>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem', margin: 0 }}>Gerencie seus TCCs, Monografias e Projetos de Extensão</p>
        </div>
        <button onClick={() => setTelaAtual('login')} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sair
        </button>
      </header>
      
      <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '50px', border: '1px solid #eaeaea' }}>
        <h2 style={{ marginTop: '0', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', display: 'inline-block' }}>
          {modoEdicao ? 'Editar Projeto/Equipe' : 'Novo Projeto/Equipe'}
        </h2>
        <form onSubmit={enviarProjeto} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <input type="text" name="nome_equipe" placeholder="Nome da Equipe (Opcional)" value={formularioProjeto.nome_equipe} onChange={lidarComMudanca} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
            <input type="text" name="titulo" placeholder="Título do Trabalho" value={formularioProjeto.titulo} onChange={lidarComMudanca} required style={{ flex: 2, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <select name="tipo" value={formularioProjeto.tipo} onChange={lidarComMudanca} required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff' }}>
              <option value="">Selecione o Tipo</option>
              <option value="TCC">TCC</option>
              <option value="Monografia">Monografia</option>
              <option value="Projeto de Extensão">Projeto de Extensão</option>
            </select>
            <input type="email" name="orientador" placeholder="E-mail do Orientador Principal" value={formularioProjeto.orientador} onChange={lidarComMudanca} style={{ flex: 2, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          </div>
          
          <textarea name="descricao" placeholder="Descrição detalhada do projeto..." value={formularioProjeto.descricao} onChange={lidarComMudanca} rows="3" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', resize: 'vertical' }} />
          
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>Membros da Equipe</h3>
              <button type="button" onClick={adicionarMembro} style={{ padding: '6px 12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Adicionar Membro</button>
            </div>
            
            {formularioProjeto.membros.map((membro, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input type="text" placeholder="Nome" value={membro.nome} onChange={(e) => atualizarMembro(index, 'nome', e.target.value)} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Cadeiras (Ex: Cadeira 1, Cadeira 2)" value={membro.disciplinas} onChange={(e) => atualizarMembro(index, 'disciplinas', e.target.value)} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Professor (Opcional)" value={membro.professor} onChange={(e) => atualizarMembro(index, 'professor', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <button type="button" onClick={() => removerMembro(index)} style={{ padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              {modoEdicao ? 'Atualizar Projeto' : 'Salvar Projeto'}
            </button>
            {modoEdicao && (
              <button type="button" onClick={cancelarEdicao} style={{ flex: 1, padding: '14px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Painel de Acompanhamento</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {projetos.length > 0 ? (
            projetos.map((projeto) => (
              <div key={projeto.id} style={{ backgroundColor: '#ffffff', borderLeft: '5px solid #3498db', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', flex: 1 }}>{projeto.titulo}</h3>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => iniciarEdicao(projeto)} style={{ backgroundColor: '#f1c40f', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Editar</button>
                    <button onClick={() => excluirProjeto(projeto.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Excluir</button>
                  </div>
                </div>
                
                {projeto.nome_equipe && <strong style={{ color: '#34495e', marginBottom: '10px', display: 'block' }}>Equipe: {projeto.nome_equipe}</strong>}

                <span style={{ display: 'inline-block', backgroundColor: '#e8f4f8', color: '#2980b9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', alignSelf: 'flex-start' }}>
                  {projeto.tipo}
                </span>
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                  <strong>Orientador Geral:</strong> {projeto.orientador || 'Aguardando definição'}
                </p>
                <p style={{ margin: '10px 0', lineHeight: '1.5', fontSize: '0.95rem' }}>{projeto.descricao}</p>
                
                {projeto.membros && projeto.membros.length > 0 && (
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#2c3e50' }}>Membros ({projeto.membros.length}):</strong>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0', color: '#555' }}>
                      {projeto.membros.map((m, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                          <strong>{m.nome}</strong> - Cadeiras: {m.disciplinas} {m.professor ? `| Prof: ${m.professor}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Nenhum projeto cadastrado no momento.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;