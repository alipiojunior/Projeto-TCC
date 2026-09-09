import React, { useState, useEffect } from 'react';

function App() {
  const [projetos, setProjetos] = useState([]);
  const [formularioProjeto, setFormularioProjeto] = useState({
    titulo: '',
    tipo: '',
    descricao: '',
    orientador: ''
  });

  useEffect(() => {
    buscarProjetos();
  }, []);

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

  const enviarProjeto = async (evento) => {
    evento.preventDefault();
    try {
      await fetch('http://localhost:8000/projetos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formularioProjeto),
      });
      
      setFormularioProjeto({ titulo: '', tipo: '', descricao: '', orientador: '' });
      buscarProjetos();
    } catch (erro) {
      console.error("Erro ao criar projeto:", erro);
    }
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#333'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '2.5rem', marginBottom: '10px' }}>
          Plataforma de Projetos Acadêmicos
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Gerencie seus TCCs, Monografias e Projetos de Extensão
        </p>
      </header>
      
      <section style={{ 
        backgroundColor: '#ffffff', 
        padding: '30px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
        marginBottom: '50px',
        border: '1px solid #eaeaea'
      }}>
        <h2 style={{ marginTop: '0', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', display: 'inline-block' }}>
          Novo Projeto
        </h2>
        <form onSubmit={enviarProjeto} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <input
              type="text"
              name="titulo"
              placeholder="Título do Trabalho"
              value={formularioProjeto.titulo}
              onChange={lidarComMudanca}
              required
              style={{ flex: 2, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
            <select
              name="tipo"
              value={formularioProjeto.tipo}
              onChange={lidarComMudanca}
              required
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff' }}
            >
              <option value="">Selecione o Tipo</option>
              <option value="TCC">TCC</option>
              <option value="Monografia">Monografia</option>
              <option value="Projeto de Extensão">Projeto de Extensão</option>
            </select>
          </div>
          
          <input
            type="email"
            name="orientador"
            placeholder="E-mail do Orientador (Convite)"
            value={formularioProjeto.orientador}
            onChange={lidarComMudanca}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <textarea
            name="descricao"
            placeholder="Descrição detalhada do projeto..."
            value={formularioProjeto.descricao}
            onChange={lidarComMudanca}
            rows="4"
            required
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', resize: 'vertical' }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Salvar Projeto
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Painel de Acompanhamento</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {projetos.length > 0 ? (
            projetos.map((projeto) => (
              <div key={projeto.id} style={{ 
                backgroundColor: '#ffffff',
                borderLeft: '5px solid #3498db', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{projeto.titulo}</h3>
                <span style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#e8f4f8', 
                  color: '#2980b9', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  alignSelf: 'flex-start'
                }}>
                  {projeto.tipo}
                </span>
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                  <strong>Orientador:</strong> {projeto.orientador || 'Aguardando definição'}
                </p>
                <p style={{ margin: '15px 0 0 0', lineHeight: '1.5' }}>
                  {projeto.descricao}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Nenhum projeto cadastrado no momento. Crie seu primeiro projeto acima.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;