
type D1Database = any;
type PagesFunction<Env> = any;

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
    const { env, request } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await request.json();
        const { email, password, nickname, realName, phone, venueName, region, location } = body;
        const finalRegion = region || location || 'Manila';

        if (!email || !password || !venueName) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // 1. Ensure tables exist before operations (D1 initialization safety)
        try {
            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    nickname TEXT NOT NULL,
                    real_name TEXT NOT NULL,
                    phone TEXT,
                    level INTEGER DEFAULT 1,
                    total_xp INTEGER DEFAULT 0,
                    streak INTEGER DEFAULT 0,
                    last_login TEXT,
                    daily_xp INTEGER DEFAULT 0,
                    quests TEXT,
                    badge_id TEXT,
                    frame_id TEXT,
                    points INTEGER DEFAULT 0,
                    role TEXT DEFAULT 'user',
                    profile_image TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();

            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS venues (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    region TEXT NOT NULL,
                    rating REAL DEFAULT 0,
                    reviews_count INTEGER DEFAULT 0,
                    description TEXT,
                    image TEXT,
                    banner_image TEXT,
                    phone TEXT,
                    address TEXT,
                    introduction TEXT,
                    tags TEXT,
                    features TEXT,
                    sns TEXT,
                    operating_hours TEXT,
                    showUpTime TEXT,
                    media TEXT,
                    menu TEXT,
                    tables TEXT,
                    rooms TEXT,
                    owner_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();
        } catch (e: any) {
            console.error("D1 table creation error:", e);
        }

        // Generate IDs
        const userId = `ua_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const venueId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Batch execution for atomicity
        await env.DB.batch([
            env.DB.prepare(`
                INSERT INTO users (id, email, password, nickname, real_name, phone, role)
                VALUES (?, ?, ?, ?, ?, ?, 'venue_admin')
            `).bind(userId, email, password, nickname || venueName, realName || venueName, phone || null),

            env.DB.prepare(`
                INSERT INTO venues (id, name, region, rating, reviews_count, owner_id, introduction)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(venueId, venueName, finalRegion, 0, 0, userId, `${venueName}에 오신 것을 환영합니다.`)
        ]);

        return new Response(JSON.stringify({
            success: true,
            userId,
            venueId
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        if (error.message.includes("UNIQUE")) {
            return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
