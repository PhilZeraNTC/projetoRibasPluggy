import { NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';

// Configuração do cliente (roda no servidor, seguro)
const pluggyClient = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

// ATENÇÃO: Tem que ser export function POST (letra maiúscula)
// Não pode ser "export default"
export async function POST() {
  try {
    const data = await pluggyClient.createConnectToken();
    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("Erro Pluggy:", error);
    return NextResponse.json({ error: 'Erro ao criar token' }, { status: 500 });
  }
}