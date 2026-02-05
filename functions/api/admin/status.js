import { jsonResponse } from '../_utils.js';

export async function onRequestGet({ env }) {
    const admin = await env.DB
        .prepare('SELECT password_hash FROM admin_settings WHERE id = 1')
        .first();
    return jsonResponse({ initialized: !!admin });
}
