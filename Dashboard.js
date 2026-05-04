// components/Dashboard.js
import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [cortes, setCortes] = useState([]);
  const [assinatura, setAssinatura] = useState('ativa');

  // WebSocket para progresso em tempo real
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.progress) setProgress(data.progress);
      if (data.status) setStatus(data.status);
      if (data.cortes) setCortes(data.cortes);
    };
    return () => ws.close();
  }, []);

  const handleDownload = async () => {
    if (!url) return alert('Cole o link do YouTube!');
    
    setStatus('processando');
    setProgress(0);
    setCortes([]);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error('Erro no processamento');
      
    } catch (error) {
      setStatus('erro');
      console.error(error);
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🎬 Corte Viral PRO</h1>
        <div className="assinatura">
          Status: <span className={assinatura === 'ativa' ? 'ativa' : 'inativa'}>
            {assinatura === 'ativa' ? '✅ ATIVA' : '❌ INATIVA'}
          </span>
          <span className="preco">R$ 70/mês</span>
        </div>
      </header>

      <main className="main-content">
        <div className="processador">
          <input
            type="text"
            placeholder="📎 Cole o link do YouTube aqui"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-url"
          />
          <button onClick={handleDownload} disabled={status === 'processando'}>
            {status === 'processando' ? '⏳ Gerando...' : '🚀 Gerar Cortes Automáticos'}
          </button>
        </div>

        {/* Barra de Progresso */}
        {status === 'processando' && (
          <div className="progresso">
            <div className="barra-progresso">
              <div className="progresso-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}% - {getStatusText(status)}</span>
          </div>
        )}

        {/* Galeria de Cortes */}
        {cortes.length > 0 && (
          <div className="galeria-cortes">
            <h2>✨ Seus Cortes Virais Prontos!</h2>
            <div className="grid-cortes">
              {cortes.map((corte, index) => (
                <VideoCard key={index} corte={corte} />
              ))}
            </div>
            <div className="acoes-finais">
              <button className="btn-download-all">📦 Baixar Todos (ZIP)</button>
              <button className="btn-share">📱 Compartilhar no TikTok</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function VideoCard({ corte }) {
  return (
    <div className="video-card">
      <video
        src={`/cortes/${corte.nome}`}
        controls
        muted
        className="video-thumb"
        poster="/thumb-placeholder.jpg"
      />
      <div className="video-info">
        <span className="duracao">{corte.duracao}</span>
        <span className="score">⭐ {corte.score}</span>
        <div className="acoes-video">
          <button>⬇️ Download</button>
          <button>📱 TikTok</button>
        </div>
      </div>
    </div>
  );
}

function getStatusText(status) {
  const textos = {
    processando: 'Analisando vídeo com IA...',
    baixando: 'Baixando vídeo do YouTube...',
    transcrevendo: 'Transcrevendo com Whisper...',
    cortando: 'Gerando cortes virais 9:16...',
    concluido: 'Cortes prontos! 🎉'
  };
  return textos[status] || status;
}
