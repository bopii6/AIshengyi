import { jsonResponse, requireAdmin } from '../_utils.js';

export async function onRequestGet({ request, env }) {
    const auth = await requireAdmin(request, env);
    if (!auth.ok) {
        return auth.response;
    }
    return jsonResponse({ ok: true });
}
