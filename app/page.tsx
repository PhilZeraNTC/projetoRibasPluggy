'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// --- O TRUQUE DE MESTRE AQUI ---
// Importamos o PluggyConnect de forma dinâmica e DESLIGAMOS o SSR (Server Side Rendering)
// Isso resolve o erro "window is not defined"
const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    // Busca o token assim que a tela carrega
    fetch('/api/pluggy/token', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.accessToken) setToken(data.accessToken);
        else console.error("Erro ao pegar token:", data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSuccess = async (data: { item: { id: string } }) => {
    console.log("Conexão feita! ID:", data.item.id);
    
    // Envia para processar (certifique-se que a rota processar também usa export POST)
    const response = await fetch('/api/pluggy/processar', {
      method: 'POST',
      body: JSON.stringify({ itemId: data.item.id }),
    });
    
    const analise = await response.json();
    setResultado(analise);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10 text-black">Analisador Financeiro</h1>

      {resultado ? (
        <div className="p-8 bg-white rounded-xl shadow-lg border border-green-500 text-center text-black">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Perfil: {resultado.perfil}</h2>
          <div className="space-y-2">
            <p>💰 Renda Total: <span className="font-bold">R$ {resultado.renda.toFixed(2)}</span></p>
            <p>💸 Gastos Totais: <span className="font-bold">R$ {resultado.gastos.toFixed(2)}</span></p>
          </div>
        </div>
      ) : (
        token ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4 text-center text-gray-600">Conecte sua conta para começar:</p>
            <div style={{ height: '600px', width: '400px' }}>
               <PluggyConnect
                connectToken={token}
                includeSandbox={true}
                onSuccess={handleSuccess}
                onError={(err) => console.error("Erro Widget:", err)}
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Carregando conexão segura...</p>
        )
      )}
    </main>
  );
}