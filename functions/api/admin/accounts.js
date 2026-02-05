import {
    errorResponse,
    jsonResponse,
    readJson,
    requireAdmin,
    validateUsername,
    validatePassword,
    hashPassword
} from '../_utils.js';

export async function onRequestGet({ request, env }) {
    const auth = await requireAdmin(request, env);
    if (!auth.ok) {
        return auth.response;
    }

    const { results } = await env.DB
        .prepare(
            'SELECT username, created_at AS createdAt, updated_at AS updatedAt FROM accounts ORDER BY username'
        )
        .all();

    return jsonResponse({ accounts: results || [] });
}

export async function onRequestPost({ request, env }) {
    const auth = await requireAdmin(request, env);
    if (!auth.ok) {
        return auth.response;
    }

    const body = (await readJson(request)) || {};
    const nameCheck = validateUsername(body.username);
    if (!nameCheck.ok) {
        return errorResponse(nameCheck.message, 400);
    }
    const passwordCheck = validatePassword(body.password);
    if (!passwordCheck.ok) {
        return errorResponse(passwordCheck.message, 400);
    }

    const passwordHash = await hashPassword(passwordCheck.value);
    const now = Date.now();
    await env.DB
        .prepare(
            `INSERT INTO accounts (username, password_hash, created_at, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(username) DO UPDATE SET
                password_hash = excluded.password_hash,
                updated_at = excluded.updated_at`
        )
        .bind(nameCheck.value, passwordHash, now, now)
        .run();

    return jsonResponse({ ok: true });
}
