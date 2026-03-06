interface Env {
    DB: any;
}

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    if (request.method === "GET") {
        const venueId = url.searchParams.get("venueId");

        if (!venueId) {
            return new Response(JSON.stringify({ error: "venueId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            // Ensure table exists
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

            const { results } = await env.DB.prepare(
                `SELECT * FROM venue_notices WHERE venue_id = ? ORDER BY is_pinned DESC, created_at DESC LIMIT 7`
            ).bind(venueId).all();

            return new Response(JSON.stringify(results || []), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
