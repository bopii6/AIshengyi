const jsonResponse = (data, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
    }
    return new Response(JSON.stringify(data), { ...init, headers });
};

const errorResponse = (message, status = 400) =>
    jsonResponse({ error: message }, { status });

const readJson = async (request) => {
    const text = await request.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
};

const normalizeUsername = (value) => (value || '').trim();

const validateUsername = (value) => {
    const name = normalizeUsername(value);
    if (!name) {
        return { ok: false, message: 'Username is required.' };
    }
    if (name.length > 32) {
        return { ok: false, message: 'Username must be at most 32 characters.' };
    }
    return { ok: true, value: name };
};

const validatePassword = (value) => {
    if (!value) {
        return { ok: false, message: 'Password is required.' };
    }
    if (value.length < 4) {
        return { ok: false, message: 'Password must be at least 4 characters.' };
    }
    return { ok: true, value };
};

const bufferToHex = (buffer) =>
    Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

const hashPassword = async (password) => {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(digest);
};

const parseBearerToken = (request) => {
    const header = request.headers.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) {
        return null;
    }
    const token = header.slice('Bearer '.length).trim();
    return token || null;
};

const requireAdmin = async (request, env) => {
    const token = parseBearerToken(request);
    if (!token) {
        return { ok: false, response: errorResponse('Unauthorized', 401) };
    }

    const now = Date.now();
    const session = await env.DB
        .prepare('SELECT token, expires_at FROM admin_sessions WHERE token = ?')
        .bind(token)
        .first();

    if (!session) {
        return { ok: false, response: errorResponse('Unauthorized', 401) };
    }

    if (session.expires_at <= now) {
        await env.DB
            .prepare('DELETE FROM admin_sessions WHERE token = ?')
            .bind(token)
            .run();
        return { ok: false, response: errorResponse('Unauthorized', 401) };
    }

    return { ok: true, token };
};

const createAdminSession = async (env, ttlMs) => {
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + ttlMs;
    await env.DB
        .prepare(
            'INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)'
        )
        .bind(token, now, expiresAt)
        .run();
    return { token, expiresAt };
};

export {
    jsonResponse,
    errorResponse,
    readJson,
    normalizeUsername,
    validateUsername,
    validatePassword,
    hashPassword,
    requireAdmin,
    createAdminSession
};
