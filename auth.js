(function () {
    'use strict';

    const STORAGE_KEYS = {
        accounts: 'ai_course_accounts',
        session: 'ai_course_session',
        admin: 'ai_course_admin'
    };

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

    const loadAccounts = () => readJson(STORAGE_KEYS.accounts, []);

    const saveAccounts = (accounts) => {
        writeJson(STORAGE_KEYS.accounts, accounts);
    };

    const findAccount = (username, accounts) =>
        (accounts || loadAccounts()).find((item) => item.username === username);

    const listAccounts = () => {
        const accounts = loadAccounts();
        return accounts
            .slice()
            .sort((a, b) => (a.username || '').localeCompare(b.username || ''));
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

        const accounts = loadAccounts();
        const existing = findAccount(nameCheck.value, accounts);
        const passwordHash = await hashPassword(passwordCheck.value);
        if (existing) {
            existing.passwordHash = passwordHash;
            existing.updatedAt = Date.now();
        } else {
            accounts.push({
                username: nameCheck.value,
                passwordHash,
                createdAt: Date.now()
            });
        }
        saveAccounts(accounts);
        return accounts;
    };

    const deleteAccount = (username) => {
        const name = normalizeUsername(username);
        if (!name) {
            return false;
        }
        const accounts = loadAccounts();
        const next = accounts.filter((item) => item.username !== name);
        if (next.length === accounts.length) {
            return false;
        }
        saveAccounts(next);
        return true;
    };

    const verifyUserPassword = async (username, password) => {
        const name = normalizeUsername(username);
        if (!name) {
            return false;
        }
        const account = findAccount(name);
        if (!account) {
            return false;
        }
        const passwordHash = await hashPassword(password);
        return passwordHash === account.passwordHash;
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
        const account = findAccount(session.username);
        if (!account) {
            clearSession();
            return null;
        }
        return session;
    };

    const isAdminInitialized = () => {
        const admin = readJson(STORAGE_KEYS.admin, null);
        return !!(admin && admin.passwordHash);
    };

    const setAdminPassword = async (password) => {
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            throw new Error(passwordCheck.message);
        }
        const passwordHash = await hashPassword(passwordCheck.value);
        writeJson(STORAGE_KEYS.admin, { passwordHash, setAt: Date.now() });
        return true;
    };

    const verifyAdminPassword = async (password) => {
        const admin = readJson(STORAGE_KEYS.admin, null);
        if (!admin || !admin.passwordHash) {
            return false;
        }
        const passwordHash = await hashPassword(password);
        return passwordHash === admin.passwordHash;
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
        verifyAdminPassword
    };
})();
