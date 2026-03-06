interface Env {
    DB: any;
}

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    // Ensure table exists
    try {
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS venue_notices (
        id TEXT PRIMARY KEY,
        venue_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    } catch (e) {
        console.error("venue_notices table init error:", e);
    }

    // GET: List notices for a venue
    if (request.method === "GET") {
        const venueId = url.searchParams.get("venueId");
        if (!venueId) {
            return new Response(JSON.stringify({ error: "venueId is required" }), {
                status: 400, headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const { results } = await env.DB.prepare(
                `SELECT * FROM venue_notices WHERE venue_id = ? ORDER BY is_pinned DESC, created_at DESC LIMIT 7`
            ).bind(venueId).all();

            return new Response(JSON.stringify(results || []), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // POST: Create a new notice
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { venue_id, title, content, is_pinned } = body;

            if (!venue_id || !title || !content) {
                return new Response(JSON.stringify({ error: "venue_id, title, content are required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            const id = `vn_${Date.now()}`;
            await env.DB.prepare(
                `INSERT INTO venue_notices (id, venue_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)`
            ).bind(id, venue_id, title, content, is_pinned ? 1 : 0).run();

            return new Response(JSON.stringify({ success: true, id }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // PATCH: Update a notice
    if (request.method === "PATCH") {
        try {
            const body = await request.json();
            const { id, title, content, is_pinned } = body;

            if (!id) {
                return new Response(JSON.stringify({ error: "id is required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            await env.DB.prepare(
                `UPDATE venue_notices SET title = ?, content = ?, is_pinned = ? WHERE id = ?`
            ).bind(title, content, is_pinned ? 1 : 0, id).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // DELETE: Delete a notice
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) {
            return new Response(JSON.stringify({ error: "id is required" }), {
                status: 400, headers: { "Content-Type": "application/json" },
            });
        }

        try {
            await env.DB.prepare(`DELETE FROM venue_notices WHERE id = ?`).bind(id).run();
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
