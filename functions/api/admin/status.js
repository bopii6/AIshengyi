import { jsonResponse } from '../_utils.js';

export async function onRequestGet({ env }) {
    const admin = await env.DB
        .prepare('SELECT id FROM admin_settings LIMIT 1')
        .first();
    return jsonResponse(
        { initialized: !!admin },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                Pragma: 'no-cache'
            }
        }
    );
}
