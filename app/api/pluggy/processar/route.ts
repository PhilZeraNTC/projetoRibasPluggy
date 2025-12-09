import { NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';
import { PrismaClient } from '@prisma/client';

const pluggy = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { itemId } = body; // Recebemos o ID da conexão

  // 1. Buscar transações dos últimos 30 dias na Pluggy
  const transactions = await pluggy.fetchTransactions(itemId, {
    from: '2023-01-01', // Em produção, calcule a data de 30 dias atrás
    pageSize: 100
  });

  // 2. Lógica de Análise (Simplificada)
  let totalEntradas = 0;
  let totalSaidas = 0;

  transactions.results.forEach((t) => {
    if (t.amount > 0) totalEntradas += t.amount; // Crédito
    else totalSaidas += Math.abs(t.amount);      // Débito
  });

  let perfil = "Equilibrado";
  if (totalSaidas > totalEntradas) perfil = "No Vermelho";
  if (totalEntradas > (totalSaidas * 1.5)) perfil = "Investidor";

  // 3. Salvar no Banco
  const analise = await prisma.analiseFinanceira.create({
    data: {
      itemId,
      perfil,
      renda: totalEntradas,
      gastos: totalSaidas
    }
  });

  return NextResponse.json(analise);
}