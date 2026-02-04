(function () {
    'use strict';

    const ADMIN_SESSION_KEY = 'ai_course_admin_session';

    const setupSection = document.getElementById('adminSetup');
    const setupForm = document.getElementById('adminSetupForm');
    const setupStatus = document.getElementById('setupStatus');
    const loginSection = document.getElementById('adminLogin');
    const loginForm = document.getElementById('adminLoginForm');
    const loginStatus = document.getElementById('loginStatus');
    const adminPanel = document.getElementById('adminPanel');
    const accountForm = document.getElementById('accountForm');
    const accountStatus = document.getElementById('accountStatus');
    const accountsList = document.getElementById('accountsList');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    const setStatus = (el, message, tone) => {
        if (!el) return;
        el.textContent = message || '';
        el.classList.remove('is-error', 'is-success');
        if (tone === 'error') {
            el.classList.add('is-error');
        }
        if (tone === 'success') {
            el.classList.add('is-success');
        }
    };

    const setAdminSession = () => {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    };

    const hasAdminSession = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';

    const clearAdminSession = () => {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
    };

    const renderAccounts = () => {
        const accounts = window.courseAuth.listAccounts();
        if (!accounts.length) {
            accountsList.innerHTML = '<div class="accounts-empty">暂无账号</div>';
            return;
        }
        const rows = accounts
            .map((item) => {
                const dateText = item.updatedAt || item.createdAt
                    ? new Date(item.updatedAt || item.createdAt).toLocaleString()
                    : '-';
                return `
                    <tr>
                        <td>${item.username}</td>
                        <td>${dateText}</td>
                        <td>
                            <button class="btn secondary" data-delete="${item.username}">删除</button>
                        </td>
                    </tr>
                `;
            })
            .join('');

        accountsList.innerHTML = `
            <table class="accounts-table">
                <thead>
                    <tr>
                        <th>账号</th>
                        <th>更新时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    };

    const showAdminPanel = () => {
        setupSection.classList.add('is-hidden');
        loginSection.classList.add('is-hidden');
        adminPanel.classList.remove('is-hidden');
        renderAccounts();
    };

    const showLoginPanel = () => {
        adminPanel.classList.add('is-hidden');
        loginSection.classList.remove('is-hidden');
    };

    const showSetupPanel = () => {
        setupSection.classList.remove('is-hidden');
        loginSection.classList.add('is-hidden');
        adminPanel.classList.add('is-hidden');
    };

    const init = () => {
        if (!window.courseAuth) {
            setStatus(loginStatus, '系统初始化失败，请刷新页面。', 'error');
            return;
        }

        if (!window.courseAuth.isAdminInitialized()) {
            showSetupPanel();
            return;
        }

        if (hasAdminSession()) {
            showAdminPanel();
            return;
        }

        showLoginPanel();
    };

    setupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(setupStatus, '');
        const password = document.getElementById('setupPassword').value;
        const confirm = document.getElementById('setupPasswordConfirm').value;
        if (password !== confirm) {
            setStatus(setupStatus, '两次输入的密码不一致', 'error');
            return;
        }
        try {
            await window.courseAuth.setAdminPassword(password);
            setStatus(setupStatus, '管理员密码已保存，请登录。', 'success');
            showLoginPanel();
        } catch (error) {
            setStatus(setupStatus, error.message || '保存失败', 'error');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(loginStatus, '');
        const password = document.getElementById('adminPassword').value;
        const ok = await window.courseAuth.verifyAdminPassword(password);
        if (!ok) {
            setStatus(loginStatus, '管理员密码错误', 'error');
            return;
        }
        setAdminSession();
        showAdminPanel();
    });

    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(accountStatus, '');
        const username = document.getElementById('accountUsername').value;
        const password = document.getElementById('accountPassword').value;
        try {
            await window.courseAuth.upsertAccount(username, password);
            setStatus(accountStatus, '账号已保存', 'success');
            accountForm.reset();
            renderAccounts();
        } catch (error) {
            setStatus(accountStatus, error.message || '操作失败', 'error');
        }
    });

    accountsList.addEventListener('click', (event) => {
        const target = event.target.closest('[data-delete]');
        if (!target) {
            return;
        }
        const username = target.dataset.delete;
        if (!confirm(`确认删除账号 ${username} 吗？`)) {
            return;
        }
        const removed = window.courseAuth.deleteAccount(username);
        if (removed) {
            renderAccounts();
            setStatus(accountStatus, '账号已删除', 'success');
        } else {
            setStatus(accountStatus, '账号不存在', 'error');
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        clearAdminSession();
        showLoginPanel();
    });

    init();
})();
