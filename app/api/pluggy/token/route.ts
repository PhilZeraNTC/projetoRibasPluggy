import { NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';

const pluggyClient = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

// IMPORTANTE: Tem que ser export async function POST (letra maiúscula)
export async function POST() {
  try {
    const data = await pluggyClient.createConnectToken();
    
    return NextResponse.json({ 
      accessToken: data.accessToken 
    }, { 
      status: 200 
    });
  } catch (error) {
    console.error("Erro ao criar token Pluggy:", error);
    
    return NextResponse.json({ 
      error: 'Não foi possível criar o token de conexão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    });
  }
}