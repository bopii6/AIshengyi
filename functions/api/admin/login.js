import {
    errorResponse,
    jsonResponse,
    readJson,
    validatePassword,
    hashPassword,
    createAdminSession
} from '../_utils.js';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export async function onRequestPost({ request, env }) {
    const admin = await env.DB
        .prepare('SELECT password_hash FROM admin_settings WHERE id = 1')
        .first();
    if (!admin) {
        return errorResponse('Admin password is not set.', 400);
    }

    const body = (await readJson(request)) || {};
    const passwordCheck = validatePassword(body.password);
    if (!passwordCheck.ok) {
        return errorResponse(passwordCheck.message, 400);
    }

    const passwordHash = await hashPassword(passwordCheck.value);
    if (passwordHash !== admin.password_hash) {
        return errorResponse('Invalid password.', 401);
    }

    const session = await createAdminSession(env, SESSION_TTL_MS);
    return jsonResponse({ token: session.token, expiresAt: session.expiresAt });
}
