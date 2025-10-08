import { GameRoom } from './game-room';
import type { Env } from './types';

export { GameRoom };

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket upgrade for game rooms
    if (url.pathname.startsWith('/game/')) {
      const roomCode = url.pathname.split('/')[2];
      
      if (!roomCode) {
        return new Response('Room code required', { status: 400 });
      }

      // Get or create Durable Object for this room
      const id = env.GAME_ROOM.idFromName(roomCode);
      const stub = env.GAME_ROOM.get(id);

      // Forward request to Durable Object
      return stub.fetch(request);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // API endpoints for game management
    if (url.pathname === '/api/create-room' && request.method === 'POST') {
      try {
        const body = await request.json() as { hostName: string; questions?: any[] };
        const roomCode = generateRoomCode();
        
        return new Response(JSON.stringify({ roomCode }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get room state (for debugging)
    if (url.pathname.startsWith('/api/room/') && request.method === 'GET') {
      const roomCode = url.pathname.split('/')[3];
      if (!roomCode) {
        return new Response('Room code required', { status: 400 });
      }

      const id = env.GAME_ROOM.idFromName(roomCode);
      const stub = env.GAME_ROOM.get(id);
      
      return stub.fetch(new Request(`${url.origin}/state`));
    }

    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders
    });
  }
};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

