import { errorResponse, jsonResponse, requireAdmin, validateUsername } from '../../_utils.js';

export async function onRequestDelete({ request, env, params }) {
    const auth = await requireAdmin(request, env);
    if (!auth.ok) {
        return auth.response;
    }

    const nameCheck = validateUsername(params.username);
    if (!nameCheck.ok) {
        return errorResponse(nameCheck.message, 400);
    }

    const result = await env.DB
        .prepare('DELETE FROM accounts WHERE username = ?')
        .bind(nameCheck.value)
        .run();

    if (!result.changes) {
        return errorResponse('Account not found.', 404);
    }

    return jsonResponse({ ok: true });
}
