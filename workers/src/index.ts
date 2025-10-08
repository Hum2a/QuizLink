import { GameRoom } from './game-room';
import { AdminAPI } from './admin-api';
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

    // Admin API endpoints
    if (url.pathname.startsWith('/api/admin/') && env.DATABASE_URL) {
      return handleAdminAPI(request, url, env);
    }

    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders
    });
  }
};

async function handleAdminAPI(request: Request, url: URL, env: Env): Promise<Response> {
  const adminAPI = new AdminAPI(env.DATABASE_URL);
  const pathParts = url.pathname.split('/');

  try {
    // GET /api/admin/quizzes - Get all quiz templates
    if (url.pathname === '/api/admin/quizzes' && request.method === 'GET') {
      const quizzes = await adminAPI.getAllQuizTemplates();
      return new Response(JSON.stringify(quizzes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /api/admin/quizzes/:id - Get specific quiz template
    if (pathParts[3] === 'quizzes' && pathParts[4] && request.method === 'GET') {
      const quiz = await adminAPI.getQuizTemplate(pathParts[4]);
      if (!quiz) {
        return new Response(JSON.stringify({ error: 'Quiz not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(quiz), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/admin/quizzes - Create quiz template
    if (url.pathname === '/api/admin/quizzes' && request.method === 'POST') {
      const body = await request.json() as any;
      const id = await adminAPI.createQuizTemplate(body);
      return new Response(JSON.stringify({ id }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /api/admin/quizzes/:id - Update quiz template
    if (pathParts[3] === 'quizzes' && pathParts[4] && request.method === 'PUT') {
      const body = await request.json() as any;
      await adminAPI.updateQuizTemplate(pathParts[4], body);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /api/admin/quizzes/:id - Delete quiz template
    if (pathParts[3] === 'quizzes' && pathParts[4] && request.method === 'DELETE') {
      await adminAPI.deleteQuizTemplate(pathParts[4]);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /api/admin/quizzes/:id/questions - Get quiz questions
    if (pathParts[3] === 'quizzes' && pathParts[4] && pathParts[5] === 'questions' && request.method === 'GET') {
      const questions = await adminAPI.getQuizQuestions(pathParts[4]);
      return new Response(JSON.stringify(questions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/admin/quizzes/:id/questions - Add question
    if (pathParts[3] === 'quizzes' && pathParts[4] && pathParts[5] === 'questions' && request.method === 'POST') {
      const body = await request.json() as any;
      body.quiz_template_id = pathParts[4];
      const id = await adminAPI.addQuestion(body);
      return new Response(JSON.stringify({ id }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT /api/admin/questions/:id - Update question
    if (pathParts[3] === 'questions' && pathParts[4] && request.method === 'PUT') {
      const body = await request.json() as any;
      await adminAPI.updateQuestion(pathParts[4], body);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /api/admin/questions/:id - Delete question
    if (pathParts[3] === 'questions' && pathParts[4] && request.method === 'DELETE') {
      await adminAPI.deleteQuestion(pathParts[4]);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/admin/quizzes/:id/reorder - Reorder questions
    if (pathParts[3] === 'quizzes' && pathParts[4] && pathParts[5] === 'reorder' && request.method === 'POST') {
      const body = await request.json() as { questionIds: string[] };
      await adminAPI.reorderQuestions(pathParts[4], body.questionIds);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /api/admin/quizzes/:id/analytics - Get quiz analytics
    if (pathParts[3] === 'quizzes' && pathParts[4] && pathParts[5] === 'analytics' && request.method === 'GET') {
      const analytics = await adminAPI.getQuizAnalytics(pathParts[4]);
      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /api/admin/categories - Get all categories
    if (url.pathname === '/api/admin/categories' && request.method === 'GET') {
      const categories = await adminAPI.getCategories();
      return new Response(JSON.stringify(categories), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', message: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

