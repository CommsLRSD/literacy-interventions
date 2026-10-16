// Transfer only validated app data, never credentials or arbitrary browser storage.
const TRANSFER_MAX_BYTES = 1000000;
const TRANSFER_MAX_CODE = 1400000;
const TRANSFER_MAX_EMAIL = 32000;
let transferPreview = null;
let transferEpoch = 0;
let transferLink = '';
let transferAuthObserver = null;

function transferStatus(key) {
    document.getElementById('transfer-status').textContent = t(key);
}

function clearProgressTransfer() {
    transferEpoch++;
    transferPreview = null;
    transferLink = '';
    document.getElementById('transfer-preview').replaceChildren();
    document.getElementById('transfer-restore').hidden = true;
    document.getElementById('transfer-email').disabled = true;
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

function validateProgressTransfer(payload) {
    if (payload?.version !== 2 || !Array.isArray(payload.sessions) || payload.sessions.length > 30 ||
        ![null, PROGRAM_ENGLISH, PROGRAM_FRENCH_IMMERSION].includes(payload.program) ||
        !['en', 'fr'].includes(payload.language) || !Array.isArray(payload.favourites)) throw new Error('Invalid snapshot');
    const sessions = readPathwaySessions(payload.sessions);
    if (sessions.length !== payload.sessions.length || new Set(sessions.map(session => session.id)).size !== sessions.length ||
        sessions.some((session, index) => !getProgramScreeners(session.context.program).some(item => item.id === session.context.screener) ||
            (payload.sessions[index].pathway && (!session.pathway ||
                session.pathway.context.screener !== session.context.screener ||
                JSON.stringify(session.pathway.context.grades) !== JSON.stringify(session.context.grades))))) {
        throw new Error('Invalid sessions');
    }
    const pathway = readSavedPathway(payload.pathway, payload.program);
    const active = sessions.find(session => session.id === payload.activeSessionId);
    if (payload.pathway && (!pathway || !active || active.status === 'completed' ||
        active.context.program !== pathway.program || active.context.screener !== pathway.context.screener ||
        JSON.stringify(active.context.grades) !== JSON.stringify(pathway.context.grades))) throw new Error('Invalid active pathway');
    const defaults = {};
    for (const program of [PROGRAM_ENGLISH, PROGRAM_FRENCH_IMMERSION]) {
        const stored = payload.defaults?.[program];
        if (!stored) continue;
        defaults[program] = {
            screener: getProgramScreeners(program).some(item => item.id === stored.screener) ? stored.screener : '',
            grades: getValidPathwayGrades(program, stored.grades ?? stored.grade),
            pillar: validatePathwayFilters(stored, program).pillar
        };
    }
    const resources = new Set(getAllResources().map(item => item.id));
    const scheduleGrades = Object.fromEntries((schedulesData?.programs || []).map(program => [program.id,
        normalizeScheduleGradeIds(payload.scheduleGrades?.[program.id]).filter(id => program.grades.some(grade => grade.id === id))]));
    const snapshot = {
        version: 2, sessions, pathway, activeSessionId: pathway ? active.id : null, defaults,
        favourites: [...new Set(payload.favourites.filter(id => resources.has(id)))],
        program: payload.program, language: payload.language,
        menuLanguage: [PROGRAM_ENGLISH, PROGRAM_FRENCH_IMMERSION].includes(payload.menuLanguage) ? payload.menuLanguage : PROGRAM_ENGLISH,
        scheduleGrades
    };
    if (JSON.stringify(snapshot).length > TRANSFER_MAX_BYTES) throw new Error('Transfer too large');
    return snapshot;
}

function captureProgressTransfer() {
    return validateProgressTransfer({
        version: 2, sessions: pathwaySessions, pathway: savedPathway, defaults: pathwayDefaults,
        activeSessionId: activePathwaySessionId, favourites: [...getFavouriteIds()],
        program: appState.selectedProgram || null, language: appState.language,
        menuLanguage: getStoredMenuLanguage(), scheduleGrades: getStoredScheduleGradePreferences()
    });
}

async function encodeProgressTransfer(snapshot) {
    let bytes = new TextEncoder().encode(JSON.stringify(snapshot));
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
    return `LIP2.${format}.${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

async function decodeProgressTransfer(code) {
    if (code.length > TRANSFER_MAX_CODE) throw new Error('Transfer too large');
    const match = /^LIP2\.([gj])\.([A-Za-z0-9_-]+)$/.exec(code);
    if (!match) throw new Error('Invalid transfer');
    const binary = atob(match[2].replace(/-/g, '+').replace(/_/g, '/'));
    if (binary.length > TRANSFER_MAX_BYTES) throw new Error('Transfer too large');
    let bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    if (match[1] === 'g') {
        bytes = await readTransferBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
    }
    return validateProgressTransfer(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}

function buildTransferEmail() {
    return `mailto:?subject=${encodeURIComponent(t('transfer_email_subject'))}&body=${encodeURIComponent(t('transfer_email_body')(transferLink))}`;
}

async function prepareTransferLink() {
    const epoch = ++transferEpoch;
    transferLink = '';
    document.getElementById('transfer-email').disabled = true;
    transferStatus('transfer_loading');
    try {
        const code = await encodeProgressTransfer(captureProgressTransfer());
        if (epoch !== transferEpoch) return;
        const url = new URL(document.baseURI);
        url.search = '';
        url.hash = `progress=${code}`;
        transferLink = url.href;
        if (buildTransferEmail().length > TRANSFER_MAX_EMAIL) {
            transferLink = '';
            return transferStatus('transfer_too_large');
        }
        document.getElementById('transfer-email').disabled = false;
        document.getElementById('transfer-status').textContent = '';
    } catch (error) {
        if (epoch === transferEpoch) transferStatus('transfer_error');
    }
}

function openProgressTransfer() {
    if (!appReady) return;
    closeMobileMenu();
    savePathwayProgress();
    clearProgressTransfer();
    document.getElementById('transfer-receive').hidden = true;
    document.getElementById('transfer-send').hidden = false;
    const dialog = document.getElementById('progress-transfer-dialog');
    if (!dialog.open) dialog.showModal();
    prepareTransferLink();
}

function emailProgressTransfer() {
    if (!appReady || !transferLink) return;
    const email = buildTransferEmail();
    if (email.length <= TRANSFER_MAX_EMAIL) window.location.href = email;
    else transferStatus('transfer_too_large');
}

async function previewProgressTransfer(code) {
    clearProgressTransfer();
    const epoch = transferEpoch;
    transferStatus('transfer_loading');
    try {
        const snapshot = await decodeProgressTransfer(code);
        if (epoch !== transferEpoch) return;
        const preview = document.getElementById('transfer-preview');
        const summary = document.createElement('p');
        summary.textContent = t('transfer_preview_summary')(snapshot.sessions.length, snapshot.favourites.length);
        const list = document.createElement('ul');
        snapshot.sessions.forEach(session => {
            const notes = getSessionNotes(session);
            const item = document.createElement('li');
            item.textContent = `${notes.date.toLocaleDateString()} · ${notes.program} · ${notes.grade} · ${notes.screener}`;
            list.appendChild(item);
        });
        preview.append(summary, list);
        transferPreview = snapshot;
        document.getElementById('transfer-restore').hidden = false;
        document.getElementById('transfer-status').textContent = '';
    } catch (error) {
        if (epoch === transferEpoch) transferStatus('transfer_error');
    }
}

async function restoreProgressTransfer() {
    if (!appReady || !transferPreview || document.getElementById('transfer-restore').disabled ||
        !window.confirm(t('transfer_replace_confirm'))) return;
    const snapshot = transferPreview;
    const previous = { sessions: pathwaySessions, pathway: savedPathway, defaults: pathwayDefaults,
        activeSessionId: activePathwaySessionId };
    const preferences = new Map();
    document.getElementById('transfer-restore').disabled = true;
    try {
        // Persist only explicitly allowed preferences; authentication stays device-local.
        const values = new Map([
            [PROGRAM_PREFERENCE_KEY, JSON.stringify({ program: snapshot.program, language: snapshot.language })],
            [FAVOURITES_KEY, JSON.stringify(snapshot.favourites)],
            [MENU_LANGUAGE_KEY, snapshot.menuLanguage],
            [SCHEDULE_GRADE_PREFERENCE_KEY, JSON.stringify(snapshot.scheduleGrades)]
        ]);
        for (const key of values.keys()) preferences.set(key, localStorage.getItem(key));
        for (const [key, value] of values) localStorage.setItem(key, value);
        progressStorageEpoch++;
        pathwaySessions = snapshot.sessions;
        savedPathway = snapshot.pathway;
        activePathwaySessionId = snapshot.activeSessionId;
        pathwayDefaults = snapshot.defaults;
        await persistProgressStorage();
        const payload = JSON.stringify({ pathway: savedPathway, defaults: pathwayDefaults,
            sessions: pathwaySessions, activeSessionId: activePathwaySessionId });
        let persisted = false;
        try { persisted = sessionStorage.getItem(PATHWAY_SESSION_KEY) === payload; } catch (error) { /* Try CacheStorage. */ }
        if (!persisted) {
            try {
                const cache = await caches.open(PATHWAY_CACHE_NAME);
                const response = await cache.match(PATHWAY_CACHE_URL);
                persisted = !!response && await response.text() === payload;
            } catch (error) { /* Do not reload an unpersisted snapshot. */ }
        }
        if (!persisted) throw new Error('Progress could not be saved');
        window.location.reload();
    } catch (error) {
        pathwaySessions = previous.sessions;
        savedPathway = previous.pathway;
        pathwayDefaults = previous.defaults;
        activePathwaySessionId = previous.activeSessionId;
        for (const [key, value] of preferences) {
            try {
                if (value === null) localStorage.removeItem(key);
                else localStorage.setItem(key, value);
            } catch (storageError) { /* Browser storage may be unavailable. */ }
        }
        transferStatus('transfer_error');
    } finally {
        document.getElementById('transfer-restore').disabled = false;
    }
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
    clearProgressTransfer();
    document.getElementById('transfer-send').hidden = true;
    document.getElementById('transfer-receive').hidden = false;
    const dialog = document.getElementById('progress-transfer-dialog');
    if (!dialog.open) dialog.showModal();
    previewProgressTransfer(code);
}

document.getElementById('progress-transfer-dialog').addEventListener('close', clearProgressTransfer);
window.addEventListener('hashchange', receiveProgressTransferLink);
