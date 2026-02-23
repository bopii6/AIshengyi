import { errorResponse, jsonResponse, readJson, validatePassword, hashPassword } from '../_utils.js';

export async function onRequestPost({ request, env }) {
    const existing = await env.DB
        .prepare('SELECT id FROM admin_settings LIMIT 1')
        .first();
    if (existing) {
        return errorResponse('Admin already initialized.', 409);
    }

    const body = (await readJson(request)) || {};
    const passwordCheck = validatePassword(body.password);
    if (!passwordCheck.ok) {
        return errorResponse(passwordCheck.message, 400);
    }

    const passwordHash = await hashPassword(passwordCheck.value);
    await env.DB
        .prepare(
            'INSERT INTO admin_settings (id, password_hash, created_at) VALUES (1, ?, ?)'
        )
        .bind(passwordHash, Date.now())
        .run();

    return jsonResponse({ ok: true });
}
