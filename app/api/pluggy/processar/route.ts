import { NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';
import { prisma } from '@/lib/prisma';

const pluggy = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

// IMPORTANTE: Tem que ser export async function POST (letra maiúscula)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId é obrigatório' },
        { status: 400 }
      );
    }

    // Para sandbox, usar período amplo de 2020 até hoje
    // Isso garante que pegamos transações de teste independente da data do sistema
    const from = '2020-01-01';
    const to = '2024-12-31';

    console.log(`📅 Período de busca: ${from} até ${to}`);
    console.log(`🏦 Item ID: ${itemId}`);
    console.log(`⏳ Iniciando busca de transações...`);

    // Buscar transações - Para sandbox, buscar um período amplo
    const transactions = await pluggy.fetchTransactions(itemId, {
      from: from,
      to: to,
      pageSize: 500
    });

    console.log(`✅ ${transactions.results.length} transações encontradas`);
    
    // 🧪 MODO DESENVOLVIMENTO: Se não houver transações, criar mock
    if (transactions.results.length === 0) {
      console.log('⚠️  Nenhuma transação encontrada. Usando dados MOCK para desenvolvimento...');
      
      transactions.results = [
        // Entradas (Salário)
        { id: 'mock-1', description: 'Salário', amount: 5000.00, date: '2024-12-01', category: 'Salário' },
        { id: 'mock-2', description: 'Freelance', amount: 1500.00, date: '2024-12-05', category: 'Renda Extra' },
        { id: 'mock-3', description: 'Investimentos', amount: 300.00, date: '2024-12-10', category: 'Investimentos' },
        
        // Saídas (Gastos)
        { id: 'mock-4', description: 'Aluguel', amount: -1200.00, date: '2024-12-02', category: 'Moradia' },
        { id: 'mock-5', description: 'Mercado', amount: -450.00, date: '2024-12-03', category: 'Alimentação' },
        { id: 'mock-6', description: 'Conta de Luz', amount: -150.00, date: '2024-12-04', category: 'Contas' },
        { id: 'mock-7', description: 'Internet', amount: -100.00, date: '2024-12-05', category: 'Contas' },
        { id: 'mock-8', description: 'Netflix', amount: -45.00, date: '2024-12-06', category: 'Lazer' },
        { id: 'mock-9', description: 'Uber', amount: -80.00, date: '2024-12-07', category: 'Transporte' },
        { id: 'mock-10', description: 'Restaurante', amount: -120.00, date: '2024-12-08', category: 'Alimentação' },
        { id: 'mock-11', description: 'Academia', amount: -90.00, date: '2024-12-09', category: 'Saúde' },
        { id: 'mock-12', description: 'Farmácia', amount: -65.00, date: '2024-12-10', category: 'Saúde' },
        { id: 'mock-13', description: 'Roupas', amount: -250.00, date: '2024-12-11', category: 'Compras' },
        { id: 'mock-14', description: 'Gasolina', amount: -200.00, date: '2024-12-12', category: 'Transporte' },
        { id: 'mock-15', description: 'Cinema', amount: -60.00, date: '2024-12-13', category: 'Lazer' },
      ] as any;
      
      transactions.total = 15;
      
      console.log('✅ Usando 15 transações MOCK para desenvolvimento');
    }
    
    // 🔍 EXIBIR JSON COMPLETO DAS TRANSAÇÕES NO TERMINAL
    console.log('\n==================== TRANSAÇÕES JSON ====================');
    console.log(JSON.stringify(transactions, null, 2));
    console.log('=========================================================\n');

    // Análise financeira
    let totalEntradas = 0;
    let totalSaidas = 0;

    transactions.results.forEach((t) => {
      if (t.amount > 0) {
        totalEntradas += t.amount;
      } else {
        totalSaidas += Math.abs(t.amount);
      }
    });

    // 📊 EXIBIR ANÁLISE DETALHADA NO TERMINAL
    console.log('\n==================== ANÁLISE DETALHADA ====================');
    console.log('Total de Entradas: R$', totalEntradas.toFixed(2));
    console.log('Total de Saídas:   R$', totalSaidas.toFixed(2));
    console.log('Economia:          R$', (totalEntradas - totalSaidas).toFixed(2));
    console.log('===========================================================\n');

    // Determinar perfil
    let perfil = "Equilibrado";
    const economia = totalEntradas - totalSaidas;
    
    if (totalSaidas > totalEntradas) {
      perfil = "No Vermelho";
    } else if (economia > (totalEntradas * 0.3)) {
      perfil = "Investidor";
    } else if (economia > (totalEntradas * 0.1)) {
      perfil = "Poupador";
    }

    // Salvar análise no banco
    const analise = await prisma.analiseFinanceira.create({
      data: {
        itemId,
        perfil,
        renda: totalEntradas,
        gastos: totalSaidas
      }
    });

    return NextResponse.json({
      ...analise,
      economia,
      percentualEconomia: totalEntradas > 0 
        ? ((economia / totalEntradas) * 100).toFixed(2) 
        : '0'
    });

  } catch (error) {
    console.error("Erro ao processar transações:", error);
    
    return NextResponse.json({
      error: 'Erro ao processar dados financeiros',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    });
  }
}