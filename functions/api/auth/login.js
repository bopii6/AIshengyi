import {
    errorResponse,
    jsonResponse,
    readJson,
    validateUsername,
    validatePassword,
    hashPassword
} from '../_utils.js';

export async function onRequestPost({ request, env }) {
    const body = (await readJson(request)) || {};
    const nameCheck = validateUsername(body.username);
    if (!nameCheck.ok) {
        return errorResponse(nameCheck.message, 400);
    }
    const passwordCheck = validatePassword(body.password);
    if (!passwordCheck.ok) {
        return errorResponse(passwordCheck.message, 400);
    }

    const account = await env.DB
        .prepare('SELECT password_hash FROM accounts WHERE username = ?')
        .bind(nameCheck.value)
        .first();
    if (!account) {
        return errorResponse('Invalid username or password.', 401);
    }

    const passwordHash = await hashPassword(passwordCheck.value);
    if (passwordHash !== account.password_hash) {
        return errorResponse('Invalid username or password.', 401);
    }

    return jsonResponse({ ok: true });
}
