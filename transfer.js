// Transfers contain catalog IDs and validated session snapshots, never browser storage or credentials.
const TRANSFER_MAX_BYTES = 1000000;
const TRANSFER_MAX_CODE = 1400000;
const TRANSFER_MAX_LINK = 1800;
let transferPreview = null;
let transferPreviewEpoch = 0;
let transferExportEpoch = 0;
let transferLink = '';
let transferAuthObserver = null;
let transferHistory = null;
let transferHistoryEpoch = 0;

function transferStatus(key) {
    document.getElementById('transfer-status').textContent = t(key);
}

function invalidateTransferPreview() {
    transferPreviewEpoch++;
    transferPreview = null;
    document.getElementById('transfer-preview').replaceChildren();
    document.getElementById('transfer-restore').hidden = true;
}

async function readTransferBytes(stream) {
    const reader = stream.getReader();
    const chunks = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > TRANSFER_MAX_BYTES) throw new Error('Transfer too large');
            chunks.push(value);
        }
    } finally {
        await reader.cancel();
        reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.length; });
    return bytes;
}

async function encodeProgressTransfer(sessions) {
    let bytes = new TextEncoder().encode(JSON.stringify({ version: 1, sessions }));
    if (bytes.length > TRANSFER_MAX_BYTES) throw new Error('Transfer too large');
    let format = 'j';
    if (typeof CompressionStream !== 'undefined') {
        const compressed = await readTransferBytes(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')));
        if (compressed.length < bytes.length) {
            bytes = compressed;
            format = 'g';
        }
    }
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    }
    return `LIP1.${format}.${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

async function decodeProgressTransfer(input) {
    let code = input.trim();
    if (code.length > TRANSFER_MAX_CODE) throw new Error('Transfer too large');
    if (!code.startsWith('LIP1.')) {
        const url = new URL(code);
        if (!['https:', 'http:'].includes(url.protocol) || !url.hash.startsWith('#progress=')) throw new Error('Invalid link');
        code = url.hash.slice('#progress='.length);
    }
    const match = /^LIP1\.([gj])\.([A-Za-z0-9_-]+)$/.exec(code);
    if (!match) throw new Error('Invalid transfer');
    const binary = atob(match[2].replace(/-/g, '+').replace(/_/g, '/'));
    if (binary.length > TRANSFER_MAX_BYTES) throw new Error('Transfer too large');
    let bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    if (match[1] === 'g') {
        bytes = await readTransferBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
    }
    const payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (payload?.version !== 1 || !Array.isArray(payload.sessions) ||
        !payload.sessions.length || payload.sessions.length > 30) throw new Error('Invalid sessions');
    const sessions = readPathwaySessions(payload.sessions);
    if (sessions.length !== payload.sessions.length || new Set(sessions.map(session => session.id)).size !== sessions.length ||
        sessions.some((session, index) => !getProgramScreeners(session.context.program).some(item => item.id === session.context.screener) ||
            (payload.sessions[index].pathway && (!session.pathway ||
                session.pathway.context.screener !== session.context.screener ||
                JSON.stringify(session.pathway.context.grades) !== JSON.stringify(session.context.grades))))) {
        throw new Error('Invalid sessions');
    }
    return sessions;
}

function transferSessionSignature(session) {
    const { id, number, ...content } = session;
    return JSON.stringify(content);
}

function planProgressTransfer(sessions) {
    const signatures = new Set(readPathwaySessions(pathwaySessions).map(transferSessionSignature));
    const additions = sessions.filter(session => {
        const signature = transferSessionSignature(session);
        if (signatures.has(signature)) return false;
        signatures.add(signature);
        return true;
    });
    return { additions, duplicates: sessions.length - additions.length };
}

function mergeProgressTransfer(additions) {
    let number = Math.max(0, ...pathwaySessions.map(session => session.number));
    const ids = new Set(pathwaySessions.map(session => session.id));
    const merged = [...pathwaySessions, ...additions.map(session => {
        const id = ids.has(session.id) ? crypto.randomUUID() : session.id;
        ids.add(id);
        return { ...session, id, number: ++number };
    })];
    // Match the existing storage reader's size bound; never import data it cannot reload.
    if (merged.length > 30 || JSON.stringify({ pathway: savedPathway, defaults: pathwayDefaults,
        sessions: merged, activeSessionId: activePathwaySessionId }).length > TRANSFER_MAX_BYTES) return null;
    return merged;
}

async function prepareTransferLink() {
    const epoch = ++transferExportEpoch;
    transferLink = '';
    for (const id of ['transfer-copy-link', 'transfer-email', 'transfer-share']) {
        document.getElementById(id).disabled = true;
    }
    const session = pathwaySessions.find(item => item.id === document.getElementById('transfer-session').value);
    if (!session) {
        document.getElementById('transfer-output').value = '';
        transferStatus('transfer_empty');
        return;
    }
    transferStatus('transfer_loading');
    try {
        const code = await encodeProgressTransfer(readPathwaySessions([session]));
        if (epoch !== transferExportEpoch) return;
        const url = new URL(document.baseURI);
        url.search = '';
        url.hash = `progress=${code}`;
        const output = document.getElementById('transfer-output');
        output.value = url.href.length <= TRANSFER_MAX_LINK ? url.href : code;
        if (url.href.length > TRANSFER_MAX_LINK) {
            transferStatus('transfer_too_large');
            return;
        }
        transferLink = url.href;
        document.getElementById('transfer-copy-link').disabled = false;
        document.getElementById('transfer-email').disabled = buildTransferEmail().length > 2000;
        document.getElementById('transfer-share').disabled = typeof navigator.share !== 'function';
        document.getElementById('transfer-status').textContent = t('transfer_link_size')(transferLink.length);
    } catch (error) {
        if (epoch === transferExportEpoch) transferStatus('transfer_error');
    }
}

function openProgressTransfer(sessionId) {
    if (!appReady) return;
    closeMobileMenu();
    savePathwayProgress();
    invalidateTransferPreview();
    document.getElementById('transfer-input').value = '';
    const select = document.getElementById('transfer-session');
    select.replaceChildren();
    pathwaySessions.slice().reverse().forEach(session => {
        const notes = getSessionNotes(session);
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${t('pathway_session')} ${session.number} · ${notes.program} · ${notes.grade} · ${notes.date.toLocaleDateString()}`;
        select.appendChild(option);
    });
    if (sessionId && pathwaySessions.some(session => session.id === sessionId)) select.value = sessionId;
    const dialog = document.getElementById('progress-transfer-dialog');
    if (!dialog.open) dialog.showModal();
    prepareTransferLink();
    prepareProgressHistory();
}

async function prepareProgressHistory() {
    const epoch = ++transferHistoryEpoch;
    transferHistory = null;
    const sessions = readPathwaySessions(pathwaySessions);
    try {
        const code = await encodeProgressTransfer(sessions);
        if (epoch === transferHistoryEpoch) transferHistory = { code, source: JSON.stringify(sessions) };
    } catch (error) { /* A click can retry; manual-copy guidance is shown if it fails. */ }
}

function buildTransferEmail() {
    return `mailto:?subject=${encodeURIComponent(t('transfer_email_subject'))}&body=${encodeURIComponent(t('transfer_email_body')(transferLink))}`;
}

async function copyTransferText(text) {
    const output = document.getElementById('transfer-output');
    output.value = text;
    try {
        await navigator.clipboard.writeText(text);
        transferStatus('transfer_copied');
    } catch (error) {
        output.focus();
        output.select();
        transferStatus('transfer_copy_manual');
    }
}

async function shareProgressTransfer(method) {
    if (!transferLink) return;
    if (method === 'email') {
        const email = buildTransferEmail();
        if (email.length <= 2000) window.location.href = email;
        else transferStatus('transfer_too_large');
    } else if (method === 'share') {
        try {
            await navigator.share({ title: t('transfer_title'), url: transferLink });
        } catch (error) {
            if (error.name !== 'AbortError') await copyTransferText(transferLink);
        }
    } else {
        await copyTransferText(transferLink);
    }
}

async function copyProgressHistory() {
    if (!appReady) return;
    savePathwayProgress();
    if (!pathwaySessions.length) return transferStatus('transfer_empty');
    // The visible output now represents the full history, not the selected session.
    const epoch = ++transferExportEpoch;
    transferLink = '';
    for (const id of ['transfer-copy-link', 'transfer-email', 'transfer-share']) {
        document.getElementById(id).disabled = true;
    }
    try {
        const sessions = readPathwaySessions(pathwaySessions);
        // Precompute on opening so mobile clipboard writes usually retain the tap's user activation.
        if (transferHistory?.source === JSON.stringify(sessions)) return await copyTransferText(transferHistory.code);
        const code = await encodeProgressTransfer(sessions);
        if (epoch === transferExportEpoch) await copyTransferText(code);
    } catch (error) {
        if (epoch === transferExportEpoch) transferStatus('transfer_error');
    }
}

async function previewProgressTransfer() {
    if (!appReady) return;
    invalidateTransferPreview();
    const epoch = transferPreviewEpoch;
    const input = document.getElementById('transfer-input').value;
    transferStatus('transfer_loading');
    try {
        const sessions = await decodeProgressTransfer(input);
        if (epoch !== transferPreviewEpoch) return;
        const { additions, duplicates } = planProgressTransfer(sessions);
        const preview = document.getElementById('transfer-preview');
        const summary = document.createElement('p');
        summary.textContent = t('transfer_preview_summary')(additions.length, duplicates);
        const list = document.createElement('ul');
        sessions.forEach(session => {
            const notes = getSessionNotes(session);
            const item = document.createElement('li');
            item.textContent = `${notes.date.toLocaleDateString()} · ${notes.program} · ${notes.grade} · ${notes.screener} · ${t(session.status === 'completed' ? 'session_completed' : session.pathway ? 'session_draft' : 'session_notes_only')}`;
            list.appendChild(item);
        });
        preview.append(summary, list);
        if (!mergeProgressTransfer(additions)) {
            transferStatus('transfer_capacity');
        } else if (!additions.length) {
            transferStatus('transfer_duplicates');
        } else {
            transferPreview = { sessions, input };
            document.getElementById('transfer-restore').hidden = false;
            document.getElementById('transfer-status').textContent = '';
        }
    } catch (error) {
        if (epoch === transferPreviewEpoch) transferStatus('transfer_error');
    }
}

async function restoreProgressTransfer() {
    if (!appReady || !transferPreview || transferPreview.input !== document.getElementById('transfer-input').value) return;
    const { additions } = planProgressTransfer(transferPreview.sessions);
    const merged = mergeProgressTransfer(additions);
    if (!merged) {
        invalidateTransferPreview();
        return transferStatus('transfer_capacity');
    }
    pathwaySessions = merged;
    invalidateTransferPreview();
    await persistProgressStorage();
    updateGuidedHome();
    prepareProgressHistory();
    transferStatus(additions.length ? 'transfer_restored' : 'transfer_duplicates');
}

function receiveProgressTransferLink() {
    if (!appReady || !window.location.hash.startsWith('#progress=')) return;
    if (document.getElementById('authGate')) {
        if (!transferAuthObserver) {
            transferAuthObserver = new MutationObserver(() => {
                if (document.getElementById('authGate')) return;
                transferAuthObserver.disconnect();
                transferAuthObserver = null;
                receiveProgressTransferLink();
            });
            transferAuthObserver.observe(document.body, { childList: true });
        }
        return;
    }
    const code = window.location.hash.slice('#progress='.length);
    // Remove the snapshot from the address bar without navigating or sending it to the server.
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
    openProgressTransfer();
    transferExportEpoch++;
    document.getElementById('transfer-input').value = code;
    previewProgressTransfer();
}

document.getElementById('transfer-session').addEventListener('change', prepareTransferLink);
document.getElementById('transfer-input').addEventListener('input', invalidateTransferPreview);
document.getElementById('progress-transfer-dialog').addEventListener('close', () => {
    invalidateTransferPreview();
    transferExportEpoch++;
    transferHistoryEpoch++;
    transferHistory = null;
    transferLink = '';
});
window.addEventListener('hashchange', receiveProgressTransferLink);
