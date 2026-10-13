// Resource previews, personal destinations, and portable saved-data backups.
const RESOURCE_BOOKMARKS_KEY = `${STORAGE_KEY_PREFIX}-resource-bookmarks`;
let resourceBookmarks = null;
let previewOriginalUrl = '';
let previewBookmarkKey = '';

function safeResourceUrl(value) {
    if (typeof value !== 'string' || value.length > 8192) return '';
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
    } catch (e) {
        return '';
    }
}

function validateResourceBookmarks(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).length > 1000) {
        throw new Error('Invalid bookmarks');
    }
    const entries = Object.entries(raw).map(([key, destination]) => {
        const pair = JSON.parse(key);
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' ||
            !pair[0] || pair[0].length > 200 || !safeResourceUrl(pair[1])) throw new Error('Invalid bookmark key');
        const url = safeResourceUrl(destination);
        if (!url) throw new Error('Invalid bookmark URL');
        return [JSON.stringify([pair[0], safeResourceUrl(pair[1])]), url];
    });
    return Object.fromEntries(entries);
}

function getResourceBookmarks() {
    if (resourceBookmarks === null) {
        try {
            resourceBookmarks = validateResourceBookmarks(JSON.parse(localStorage.getItem(RESOURCE_BOOKMARKS_KEY) || '{}'));
        } catch (e) { resourceBookmarks = {}; }
    }
    return resourceBookmarks;
}

function resourceDestination(original, key) {
    const url = safeResourceUrl(original);
    return getResourceBookmarks()[key] || url;
}

function buildResourceDestinationHtml(original, id, name, title, className, label) {
    const url = safeResourceUrl(original);
    if (!url) return '';
    const key = JSON.stringify([id, url]);
    const previewLabel = `${t('resource_preview')}: ${name}`;
    return `<a class="${className}" data-resource-original="${escapeAttr(url)}" data-resource-bookmark-key="${escapeAttr(key)}" href="${escapeAttr(resourceDestination(url, key))}"
        target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" aria-label="${escapeAttr(title)}" title="${escapeAttr(title)}">${escapeHtml(label)}<span class="material-symbols-rounded" aria-hidden="true" translate="no">open_in_new</span></a>
        <button type="button" class="resource-preview-btn" data-resource-preview="${escapeAttr(url)}" data-resource-bookmark-key="${escapeAttr(key)}" data-resource-title="${escapeAttr(name)}"
        aria-label="${escapeAttr(previewLabel)}" title="${escapeAttr(previewLabel)}"><span class="material-symbols-rounded" aria-hidden="true" translate="no">preview</span></button>`;
}

function refreshResourceDestinations() {
    document.querySelectorAll('[data-resource-original]').forEach(link => {
        link.href = resourceDestination(link.dataset.resourceOriginal, link.dataset.resourceBookmarkKey);
    });
}

function initializeResourceBrowser() {
    document.querySelectorAll('#resources-section a.resource-link').forEach(link => {
        const original = safeResourceUrl(link.href);
        if (!original || link.dataset.resourceOriginal) return;
        link.dataset.resourceOriginal = original;
        const key = JSON.stringify([link.querySelector('.resource-link-label')?.dataset.i18n || original, original]);
        link.dataset.resourceBookmarkKey = key;
        const name = link.querySelector('.resource-link-label')?.textContent || link.textContent;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'resource-preview-btn';
        button.dataset.resourcePreview = original;
        button.dataset.resourceBookmarkKey = key;
        button.dataset.resourceTitle = name.trim();
        button.setAttribute('aria-label', `${t('resource_preview')}: ${name.trim()}`);
        button.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true" translate="no">preview</span>';
        link.after(button);
    });
    refreshResourceDestinations();
}

function loadResourcePreview() {
    const input = document.getElementById('resource-browser-url');
    const url = safeResourceUrl(input.value.trim());
    if (!url) {
        document.getElementById('resource-browser-status').textContent = t('resource_url_invalid');
        input.focus();
        return false;
    }
    input.value = url;
    document.getElementById('resource-browser-frame').src = url;
    document.getElementById('resource-browser-external').href = url;
    document.getElementById('resource-browser-status').textContent = '';
    return true;
}

function openResourcePreview(original, name, key) {
    previewOriginalUrl = safeResourceUrl(original);
    if (!previewOriginalUrl) return;
    previewBookmarkKey = key;
    const dialog = document.getElementById('resource-browser');
    const host = document.fullscreenElement || document.body;
    if (dialog.parentElement !== host) host.appendChild(dialog);
    document.getElementById('resource-browser-title').textContent = name;
    document.getElementById('resource-browser-url').value = resourceDestination(previewOriginalUrl, key);
    loadResourcePreview();
    if (!dialog.open) dialog.showModal();
}

function storeResourceBookmark(destination) {
    const next = { ...getResourceBookmarks() };
    if (destination) next[previewBookmarkKey] = destination;
    else delete next[previewBookmarkKey];
    if (Object.keys(next).length > 1000) {
        document.getElementById('resource-browser-status').textContent = t('saved_storage_error');
        return false;
    }
    try {
        localStorage.setItem(RESOURCE_BOOKMARKS_KEY, JSON.stringify(next));
    } catch (e) {
        document.getElementById('resource-browser-status').textContent = t('saved_storage_error');
        return false;
    }
    resourceBookmarks = next;
    refreshResourceDestinations();
    return true;
}

function saveResourceBookmark() {
    if (!previewOriginalUrl || !loadResourcePreview()) return;
    if (storeResourceBookmark(document.getElementById('resource-browser-url').value)) {
        document.getElementById('resource-browser-status').textContent = t('resource_bookmark_saved');
    }
}

function resetResourceBookmark() {
    if (!previewOriginalUrl || !storeResourceBookmark(null)) return;
    document.getElementById('resource-browser-url').value = previewOriginalUrl;
    loadResourcePreview();
    document.getElementById('resource-browser-status').textContent = t('resource_bookmark_restored');
}

document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-resource-preview]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    openResourcePreview(button.dataset.resourcePreview, button.dataset.resourceTitle, button.dataset.resourceBookmarkKey);
}, true);

document.getElementById('resource-browser-form').addEventListener('submit', event => {
    event.preventDefault();
    loadResourcePreview();
});
document.getElementById('resource-browser').addEventListener('keydown', event => event.stopPropagation());
document.getElementById('resource-browser').addEventListener('close', () => {
    document.getElementById('resource-browser-frame').removeAttribute('src');
    previewOriginalUrl = '';
    previewBookmarkKey = '';
});

function savedDataStatus(key) {
    document.getElementById('saved-data-status').textContent = t(key);
}

async function exportSavedData() {
    if (!appReady) return;
    await progressStorageQueue;
    const data = {
        format: 'literacy-interventions-backup', version: 1,
        preferences: { program: appState.selectedProgram, language: appState.language,
            scheduleGrades: getStoredScheduleGradePreferences() },
        favourites: [...getFavouriteIds()], bookmarks: getResourceBookmarks(),
        progress: { pathway: savedPathway, defaults: pathwayDefaults,
            sessions: pathwaySessions, activeSessionId: activePathwaySessionId }
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `literacy-interventions-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    savedDataStatus('saved_exported');
}

function validateSavedData(data) {
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    if (!object(data) || data.format !== 'literacy-interventions-backup' || data.version !== 1 ||
        !object(data.preferences) || !object(data.progress) || !object(data.progress.defaults) ||
        !Object.hasOwn(data.progress, 'pathway') || !Array.isArray(data.progress.sessions) ||
        !Array.isArray(data.favourites) || !data.favourites.every(id => typeof id === 'string') ||
        ![null, PROGRAM_ENGLISH, PROGRAM_FRENCH_IMMERSION].includes(data.preferences.program) ||
        !['en', 'fr'].includes(data.preferences.language) || !object(data.preferences.scheduleGrades)) {
        throw new Error('Invalid backup');
    }
    const bookmarks = validateResourceBookmarks(data.bookmarks);
    const validIds = new Set(getAllResources().map(item => item.id));
    const defaults = {};
    for (const program of [PROGRAM_ENGLISH, PROGRAM_FRENCH_IMMERSION]) {
        const raw = data.progress.defaults[program];
        if (!raw) continue;
        if (!object(raw)) throw new Error('Invalid defaults');
        defaults[program] = {
            screener: (appState.tierFlowchartData?.tier1?.screeners || []).some(item => item.id === raw.screener) ? raw.screener : '',
            grades: getValidPathwayGrades(program, raw.grades),
            pillar: typeof raw.pillar === 'string' && raw.pillar.length <= 150 ? raw.pillar : 'Phonics'
        };
    }
    const scheduleGrades = {};
    for (const program of schedulesData?.programs || []) {
        const allowed = new Set((program.grades || []).map(grade => grade.id));
        scheduleGrades[program.id] = normalizeScheduleGradeIds(data.preferences.scheduleGrades[program.id])
            .filter(id => allowed.has(id));
    }
    const previousProgram = appState.selectedProgram;
    let pathway;
    try {
        appState.selectedProgram = data.preferences.program;
        pathway = readSavedPathway(data.progress.pathway);
        if (data.progress.pathway !== null && !pathway) throw new Error('Invalid pathway');
    } finally { appState.selectedProgram = previousProgram; }
    const sessions = readPathwaySessions(data.progress.sessions);
    return {
        preferences: { program: data.preferences.program,
            language: data.preferences.program ? normalizeProgramLanguage(data.preferences.program, data.preferences.language) : data.preferences.language,
            scheduleGrades },
        favourites: [...new Set(data.favourites.filter(id => validIds.has(id)))], bookmarks,
        progress: { pathway, defaults, sessions,
            activeSessionId: pathway && sessions.some(session => session.id === data.progress.activeSessionId)
                ? data.progress.activeSessionId : null }
    };
}

async function importSavedData(input) {
    const file = input.files?.[0];
    input.value = '';
    if (!file || !appReady) return;
    let data;
    try {
        if (file.size > 1000000) throw new Error('Backup too large');
        data = validateSavedData(JSON.parse(await file.text()));
    } catch (e) {
        savedDataStatus('saved_import_invalid');
        return;
    }
    if (!window.confirm(t('saved_import_confirm'))) return;
    appReady = false;
    await progressStorageQueue;
    const entries = [
        [PROGRAM_PREFERENCE_KEY, JSON.stringify(data.preferences)],
        [SCHEDULE_GRADE_PREFERENCE_KEY, JSON.stringify(data.preferences.scheduleGrades)],
        [FAVOURITES_KEY, JSON.stringify(data.favourites)],
        [RESOURCE_BOOKMARKS_KEY, JSON.stringify(data.bookmarks)]
    ];
    const previous = [];
    try {
        for (const [key, value] of entries) {
            previous.push([key, localStorage.getItem(key)]);
            localStorage.setItem(key, value);
        }
        // Use the session fallback too, so reload restores the backup even when CacheStorage fails.
        sessionStorage.setItem(PATHWAY_SESSION_KEY, JSON.stringify(data.progress));
    } catch (e) {
        for (const [key, value] of previous) {
            try {
                if (value === null) localStorage.removeItem(key);
                else localStorage.setItem(key, value);
            } catch (error) { /* Storage may have become unavailable. */ }
        }
        appReady = true;
        savedDataStatus('saved_storage_error');
        return;
    }
    progressStorageEpoch++;
    savedPathway = data.progress.pathway;
    pathwayDefaults = data.progress.defaults;
    pathwaySessions = data.progress.sessions;
    activePathwaySessionId = data.progress.activeSessionId;
    await persistProgressStorage();
    window.location.reload();
}
