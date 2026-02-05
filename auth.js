(function () {
    'use strict';

    const STORAGE_KEYS = {
        session: 'ai_course_session',
        adminToken: 'ai_course_admin_token'
    };

    const API_BASE = '/api';

    const readJson = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    };

    const writeJson = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const normalizeUsername = (value) => (value || '').trim();

    const validateUsername = (value) => {
        const name = normalizeUsername(value);
        if (!name) {
            return { ok: false, message: '请输入账号' };
        }
        if (name.length > 32) {
            return { ok: false, message: '账号长度不能超过32位' };
        }
        return { ok: true, value: name };
    };

    const validatePassword = (value) => {
        if (!value) {
            return { ok: false, message: '请输入密码' };
        }
        if (value.length < 4) {
            return { ok: false, message: '密码至少4位' };
        }
        return { ok: true, value };
    };

    const bufferToHex = (buffer) =>
        Array.from(new Uint8Array(buffer))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');

    const hashPassword = async (password) => {
        if (window.crypto && window.crypto.subtle) {
            const data = new TextEncoder().encode(password);
            const digest = await window.crypto.subtle.digest('SHA-256', data);
            return bufferToHex(digest);
        }
        return btoa(unescape(encodeURIComponent(password)));
    };

    const getAdminToken = () => sessionStorage.getItem(STORAGE_KEYS.adminToken);

    const clearAdminToken = () => {
        sessionStorage.removeItem(STORAGE_KEYS.adminToken);
    };

    const requestJson = async (path, options = {}) => {
        const headers = new Headers(options.headers || {});
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const body =
            options.body && typeof options.body !== 'string'
                ? JSON.stringify(options.body)
                : options.body;

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
            body
        });

        const text = await response.text();
        let payload = null;
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                payload = null;
            }
        }

        if (!response.ok) {
            const message =
                (payload && payload.error) || '请求失败，请稍后再试';
            const error = new Error(message);
            error.status = response.status;
            throw error;
        }

        return payload;
    };

    const adminRequest = async (path, options = {}) => {
        const token = getAdminToken();
        if (!token) {
            const error = new Error('请先登录管理员');
            error.status = 401;
            throw error;
        }
        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        return requestJson(path, { ...options, headers });
    };

    const listAccounts = async () => {
        const data = await adminRequest('/admin/accounts', { method: 'GET' });
        return (data && data.accounts) || [];
    };

    const upsertAccount = async (username, password) => {
        const nameCheck = validateUsername(username);
        if (!nameCheck.ok) {
            throw new Error(nameCheck.message);
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            throw new Error(passwordCheck.message);
        }

        await adminRequest('/admin/accounts', {
            method: 'POST',
            body: { username: nameCheck.value, password: passwordCheck.value }
        });
        return true;
    };

    const deleteAccount = async (username) => {
        const name = normalizeUsername(username);
        if (!name) {
            return false;
        }
        try {
            await adminRequest(`/admin/accounts/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            if (error && error.status === 404) {
                return false;
            }
            throw error;
        }
    };

    const verifyUserPassword = async (username, password) => {
        const nameCheck = validateUsername(username);
        if (!nameCheck.ok) {
            return false;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            return false;
        }
        try {
            const data = await requestJson('/auth/login', {
                method: 'POST',
                body: { username: nameCheck.value, password: passwordCheck.value }
            });
            return !!(data && data.ok);
        } catch (error) {
            if (error && error.status === 401) {
                return false;
            }
            console.error(error);
            return false;
        }
    };

    const setSession = (username) => {
        writeJson(STORAGE_KEYS.session, { username, at: Date.now() });
    };

    const clearSession = () => {
        localStorage.removeItem(STORAGE_KEYS.session);
    };

    const getSession = () => {
        const session = readJson(STORAGE_KEYS.session, null);
        if (!session || !session.username) {
            return null;
        }
        return session;
    };

    const isAdminInitialized = async () => {
        const data = await requestJson('/admin/status', { method: 'GET' });
        return !!(data && data.initialized);
    };

    const setAdminPassword = async (password) => {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            throw new Error(passwordCheck.message);
        }
        await requestJson('/admin/setup', {
            method: 'POST',
            body: { password: passwordCheck.value }
        });
        return true;
    };

    const verifyAdminPassword = async (password) => {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            throw new Error(passwordCheck.message);
        }
        const data = await requestJson('/admin/login', {
            method: 'POST',
            body: { password: passwordCheck.value }
        });
        if (!data || !data.token) {
            return null;
        }
        sessionStorage.setItem(STORAGE_KEYS.adminToken, data.token);
        return data.token;
    };

    const verifyAdminSession = async () => {
        try {
            await adminRequest('/admin/session', { method: 'GET' });
            return true;
        } catch (error) {
            if (error && (error.status === 401 || error.status === 403)) {
                clearAdminToken();
                return false;
            }
            throw error;
        }
    };

    window.courseAuth = {
        validateUsername,
        validatePassword,
        normalizeUsername,
        hashPassword,
        listAccounts,
        upsertAccount,
        deleteAccount,
        verifyUserPassword,
        setSession,
        getSession,
        clearSession,
        isAdminInitialized,
        setAdminPassword,
        verifyAdminPassword,
        verifyAdminSession
    };
})();
