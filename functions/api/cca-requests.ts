interface Env {
    DB: any;
}

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    // Ensure table exists
    try {
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS cca_requests (
        id TEXT PRIMARY KEY,
        cca_id TEXT NOT NULL,
        venue_id TEXT NOT NULL,
        cca_name TEXT,
        venue_name TEXT,
        customer_name TEXT NOT NULL,
        customer_contact TEXT,
        customer_note TEXT,
        preferred_date TEXT,
        preferred_time TEXT,
        group_size INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    } catch (e) {
        console.error("cca_requests table init error:", e);
    }

    // GET: List requests
    if (request.method === "GET") {
        const ccaId = url.searchParams.get("ccaId");
        const venueId = url.searchParams.get("venueId");

        try {
            let query, params;
            if (ccaId) {
                query = `SELECT * FROM cca_requests WHERE cca_id = ? ORDER BY created_at DESC`;
                params = [ccaId];
            } else if (venueId) {
                query = `SELECT * FROM cca_requests WHERE venue_id = ? ORDER BY created_at DESC`;
                params = [venueId];
            } else {
                return new Response(JSON.stringify({ error: "ccaId or venueId is required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            const { results } = await env.DB.prepare(query).bind(...params).all();
            return new Response(JSON.stringify(results || []), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // POST: Create a request
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { cca_id, venue_id, cca_name, venue_name, customer_name, customer_contact, customer_note, preferred_date, preferred_time, group_size } = body;

            if (!cca_id || !venue_id || !customer_name) {
                return new Response(JSON.stringify({ error: "cca_id, venue_id, customer_name are required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            const id = `cr_${Date.now()}`;
            await env.DB.prepare(
                `INSERT INTO cca_requests (id, cca_id, venue_id, cca_name, venue_name, customer_name, customer_contact, customer_note, preferred_date, preferred_time, group_size)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(id, cca_id, venue_id, cca_name || '', venue_name || '', customer_name, customer_contact || '', customer_note || '', preferred_date || '', preferred_time || '', group_size || 1).run();

            return new Response(JSON.stringify({ success: true, id }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // PATCH: Update request status
    if (request.method === "PATCH") {
        try {
            const body = await request.json();
            const { id, status } = body;

            if (!id || !status) {
                return new Response(JSON.stringify({ error: "id and status are required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            await env.DB.prepare(
                `UPDATE cca_requests SET status = ? WHERE id = ?`
            ).bind(status, id).run();

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
