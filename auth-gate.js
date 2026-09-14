(function () {
    var KEY = 'litlab_auth';
    var PWD = 'lrsd2627';
    var isAuthed = false;

    try {
        isAuthed = sessionStorage.getItem(KEY) === '1';
    } catch (e) {
        isAuthed = false;
    }

    if (isAuthed) return;

    var overlay = document.createElement('div');
    overlay.id = 'authGate';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:9999',
        'display:flex', 'align-items:center', 'justify-content:center',
        'background:var(--bg,#f4f5f7)', 'flex-direction:column',
        'gap:1rem', 'font-family:inherit'
    ].join(';');

    var card = document.createElement('div');
    card.style.cssText = [
        'background:var(--card,#fff)', 'border-radius:1rem',
        'padding:2.5rem 2rem', 'max-width:360px', 'width:90%',
        'box-shadow:0 4px 24px rgba(0,0,0,.12)', 'text-align:center'
    ].join(';');

    card.innerHTML =
        '<p style="font-size:1.5rem;font-weight:700;margin:0 0 .25rem">LitLab</p>' +
        '<p style="margin:0 0 1.5rem;color:#666;font-size:.9rem">Louis Riel School Division — Staff Access</p>' +
        '<input id="authPwd" type="password" placeholder="Enter password" autocomplete="current-password" ' +
        'style="width:100%;box-sizing:border-box;padding:.65rem .9rem;font-size:1rem;' +
        'border:2px solid #ddd;border-radius:.5rem;margin-bottom:.75rem;outline:none"/>' +
        '<p id="authErr" style="color:#c0392b;font-size:.85rem;margin:.25rem 0 .5rem;min-height:1.2em"></p>' +
        '<button id="authBtn" type="button" ' +
        'style="width:100%;padding:.7rem;font-size:1rem;font-weight:600;' +
        'background:#1a56db;color:#fff;border:none;border-radius:.5rem;cursor:pointer">Enter</button>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function rememberAuthenticated() {
        try {
            sessionStorage.setItem(KEY, '1');
        } catch (e) {
            /* Ignore storage failures; unlock still works for the current page. */
        }
    }

    function unlock() {
        rememberAuthenticated();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.body.style.overflow = '';
    }

    function tryAuth() {
        var input = document.getElementById('authPwd');
        var err = document.getElementById('authErr');
        var val = input ? input.value : '';
        if (val === PWD) {
            unlock();
            return;
        }
        if (err) err.textContent = 'Incorrect password. Please try again.';
        if (input) {
            input.value = '';
            input.focus();
        }
    }

    document.getElementById('authBtn').addEventListener('click', tryAuth);
    document.getElementById('authPwd').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') tryAuth();
    });
    document.getElementById('authPwd').focus();
})();
