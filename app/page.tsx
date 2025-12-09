'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

interface AnaliseResult {
  perfil: string;
  renda: number;
  gastos: number;
  economia: number;
  percentualEconomia: string;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AnaliseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Busca o token assim que a tela carrega
    fetch('/api/pluggy/token', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.accessToken) {
          setToken(data.accessToken);
        } else {
          setError(data.error || "Erro ao obter token");
          console.error("Erro ao pegar token:", data);
        }
      })
      .catch(err => {
        setError("Falha na conexão com o servidor");
        console.error(err);
      });
  }, []);

  const handleSuccess = async (data: { item: { id: string } }) => {
    console.log("Conexão bancária realizada! ID:", data.item.id);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pluggy/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: data.item.id }),
      });
      
      const analise = await response.json();
      
      if (response.ok) {
        setResultado(analise);
      } else {
        setError(analise.error || "Erro ao processar dados");
        console.error("Erro na análise:", analise);
      }
    } catch (err) {
      setError("Erro ao processar análise financeira");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error("Erro no Widget Pluggy:", err);
    setError("Erro ao conectar com o banco");
  };

  // 🧪 FUNÇÃO PARA TESTE COM DADOS MOCK
  const testarComMock = async () => {
    console.log("🧪 Testando com dados MOCK...");
    setLoading(true);
    setError(null);
    
    try {
      // Simular um itemId fake para acionar o modo mock no backend
      const response = await fetch('/api/pluggy/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: 'mock-test-id' }),
      });
      
      const analise = await response.json();
      
      if (response.ok) {
        setResultado(analise);
      } else {
        setError(analise.error || "Erro ao processar dados");
        console.error("Erro na análise:", analise);
      }
    } catch (err) {
      setError("Erro ao processar análise financeira");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">
          Analisador Financeiro
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Conecte sua conta bancária e descubra seu perfil financeiro
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Analisando suas transações...</p>
          </div>
        )}

        {resultado && !loading && (
          <div className="p-8 bg-white rounded-xl shadow-lg border border-green-200">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                {resultado.perfil}
              </h2>
              <p className="text-gray-600">Seu perfil financeiro</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">💰 Renda Total:</span>
                <span className="font-bold text-green-700">
                  R$ {resultado.renda.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">💸 Gastos Totais:</span>
                <span className="font-bold text-red-700">
                  R$ {resultado.gastos.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">💎 Economia:</span>
                <span className="font-bold text-blue-700">
                  R$ {resultado.economia.toFixed(2)} ({resultado.percentualEconomia}%)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setResultado(null);
                setError(null);
              }}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Nova Análise
            </button>
          </div>
        )}

        {!resultado && !loading && token && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="mb-4 text-center text-gray-600 font-medium">
              Conecte sua conta bancária para começar:
            </p>
            
            {/* 🧪 BOTÃO DE TESTE COM MOCK */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2 text-center">
                🧪 <strong>Modo de Desenvolvimento</strong>
              </p>
              <p className="text-xs text-yellow-700 mb-3 text-center">
                Teste o sistema sem conectar ao banco (usa dados simulados)
              </p>
              <button
                onClick={testarComMock}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🧪 Testar com Dados Mock
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou conecte seu banco real</span>
              </div>
            </div>

            <div className="flex justify-center mt-4" style={{ height: '600px', width: '100%' }}>
              <PluggyConnect
                connectToken={token}
                includeSandbox={true}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </div>
        )}

        {!token && !error && (
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando conexão segura...</p>
          </div>
        )}
      </div>
    </main>
  );
}