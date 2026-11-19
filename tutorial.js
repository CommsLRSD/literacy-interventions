(() => {
    const byId = id => document.getElementById(id);
    const dialog = byId('app-tutorial');
    const panel = dialog.querySelector('.tutorial-panel');
    const spotlight = dialog.querySelector('.tutorial-spotlight');
    const heading = byId('tutorial-heading');
    const next = byId('tutorial-next');
    const status = byId('tutorial-status');
    const params = new URL(window.location.href).searchParams;
    const step = (page, selector, en, fr, ready = () => true, enter) =>
        ({ page, selector, en, fr, ready, enter });
    const program = step('home', () => byId('program-prompt-modal').hidden
        ? '#home-program-select' : '#program-prompt-language',
    ['Choose a teaching program', 'Open the highlighted menu and choose English or French Immersion. For French Immersion, also choose the display language. This is a practice copy: your saved work is safe.'],
    ['Choisir un programme', 'Ouvrez le menu et choisissez le programme anglais ou l’immersion française. En immersion, choisissez aussi la langue d’affichage. Cette copie d’exercice ne modifie pas vos données.'],
    () => !!appState.selectedProgram && byId('program-prompt-modal').hidden);
    const setup = [
        program,
        step('home', '#home-screener-select',
            ['Select a screener', 'Open the screener menu and choose an assessment. Watch how the app remembers this choice for the pathway.'],
            ['Choisir un outil de dépistage', 'Ouvrez le menu et choisissez une évaluation. L’application conserve ce choix pour le parcours.'],
            () => !!byId('home-screener-select').value),
        step('home', '#home-grade-select',
            ['Select a grade', 'Open the grade menu and select a teaching grade. The pathway and resources will use this grade.'],
            ['Choisir un niveau scolaire', 'Ouvrez le menu et choisissez un niveau. Le parcours et les ressources tiendront compte de ce niveau.'],
            () => !!byId('home-grade-select').value),
        step('home', '#home-start-btn',
            ['Start the practice pathway', 'Select “Guide me through the process” in the app, not Next here. The app will build Tier 1 using your selections.'],
            ['Démarrer le parcours d’exercice', 'Sélectionnez le bouton de démarrage dans l’application, et non Suivant ici. Le palier 1 utilisera vos choix.'],
            () => appState.currentPage === 'flowchart')
    ];
    let nodeAtEntry;
    const nodeId = () => appState.visualFlowchart?.currentNodeId;
    const liveNode = () => `.flowchart-step[data-node-id="${CSS.escape(nodeId() || '')}"]`;
    const flowTarget = () => {
        const node = document.querySelector(liveNode());
        const unchecked = node?.querySelector('.checklist-line input:not(:checked)');
        return unchecked?.closest('label') || node?.querySelector('.checklist-continue-btn') || node;
    };
    const flowChanged = () => !!nodeId() && nodeId() !== nodeAtEntry;
    const rememberNode = () => { nodeAtEntry = nodeId(); };
    const tours = [
        ['tutorial_setup', setup],
        ['nav_flowchart', [
            ...setup,
            step('flowchart', flowTarget,
                ['Review the checklist', 'Tick each principle in the actual checklist. The highlight moves to the next item. When all are checked, select Continue to Results in the app.'],
                ['Vérifier les principes', 'Cochez chaque principe dans la liste. La mise en évidence passe au suivant. Une fois tous les principes cochés, poursuivez vers les résultats dans l’application.'],
                flowChanged, rememberNode),
            step('flowchart', liveNode,
                ['Make a practice decision', 'Read the question and choose an answer in the app. This is only an example: use actual learner evidence outside practice. Watch the pathway move to the next step.'],
                ['Prendre une décision d’exercice', 'Lisez la question et choisissez une réponse dans l’application. Il s’agit d’un exemple : hors exercice, utilisez les données de l’élève. Le parcours passera à l’étape suivante.'],
                flowChanged, rememberNode),
            step('flowchart', () => byId('visual-flowchart-viewport') ? '#visual-flowchart-viewport' : '#journey-map',
                ['See your pathway in action', 'The pathway now shows your decisions and the next step or outcome. On larger screens, drag the visual map to explore. Finish discards this practice session, not your saved work.'],
                ['Voir le parcours en action', 'Le parcours affiche vos décisions et la prochaine étape ou le résultat. Sur grand écran, faites glisser la carte pour l’explorer. Terminer efface seulement cet exercice, et non vos données.'],
                () => true, () => openVisualFlowchartModal())
        ]],
        ['nav_interventions', [
            program,
            step('interventions', '#menu-type-filter',
                ['Choose Intervention', 'Open Resource type and select Intervention for this example. The app will reveal the next filters.'],
                ['Choisir Intervention', 'Ouvrez le menu du type de ressource et choisissez Intervention pour cet exemple. Les filtres suivants apparaîtront.'],
                () => menuState.resourceType === 'Intervention',
                () => { setToolkitView('guided'); menuUiState.view = 'search'; applyMenuViewState(); }),
            step('interventions', '#menu-pillar-filter',
                ['Open the skills menu', 'Select the Literacy pillars heading to open its real dropdown.'],
                ['Ouvrir le menu des habiletés', 'Sélectionnez le titre des piliers de la littératie pour ouvrir le menu.'],
                () => byId('menu-pillar-filter').open),
            step('interventions', '#menu-pillar-filter',
                ['Select a literacy pillar', 'Check one or more skills in the open menu. Select Next when you are happy with the selection.'],
                ['Choisir un pilier', 'Cochez une ou plusieurs habiletés dans le menu ouvert, puis sélectionnez Suivant.'],
                () => getMenuPillars().length > 0),
            step('interventions', '#filter-tier-chips',
                ['Choose a tier', 'Select a tier button. Notice how completing the required choices makes Search available.'],
                ['Choisir un palier', 'Sélectionnez un bouton de palier. Une fois les choix obligatoires remplis, la recherche sera disponible.'],
                () => !!menuState.tier,
                () => { byId('menu-pillar-filter').open = false; }),
            step('interventions', '#menu-search-submit-btn',
                ['Run the search', 'Select Search in the app to see real matching resources.'],
                ['Lancer la recherche', 'Sélectionnez Rechercher dans l’application pour afficher les ressources correspondantes.'],
                () => menuUiState.view === 'results'),
            step('interventions', '#dropdown-results',
                ['Inspect the results', 'These are the actual results for your choices. Read the cards or expand Advanced filters to narrow them. If none match, change the criteria or try the table next.'],
                ['Examiner les résultats', 'Voici les résultats de vos choix. Lisez les fiches ou ouvrez les filtres avancés. S’il n’y a aucun résultat, modifiez les critères ou essayez le tableau ensuite.']),
            step('interventions', '#toolkit-view-toggle',
                ['Open the resource table', 'Turn on All resources in the app. This is a different way to browse the same resource catalogue.'],
                ['Ouvrir le tableau des ressources', 'Activez Toutes les ressources dans l’application pour parcourir le même catalogue autrement.'],
                () => byId('toolkit-view-toggle').getAttribute('aria-checked') === 'true'),
            step('interventions', '#toolkit-table-search',
                ['Filter the table yourself', 'Type a word, such as phonics, and watch the rows and result count update. Try changing or clearing the word. Finish will discard this practice copy.'],
                ['Filtrer le tableau', 'Entrez un mot et observez les lignes et le nombre de résultats. Modifiez ou effacez le mot. Terminer fermera cette copie d’exercice.'],
                () => !!byId('toolkit-table-search').value.trim())
        ]],
        ['nav_schedule', [
            program,
            step('schedule', '#schedule-grade-filter',
                ['Open the grade filter', 'Select the grade heading to open the schedule’s dropdown menu.'],
                ['Ouvrir le filtre des niveaux', 'Sélectionnez le titre des niveaux pour ouvrir le menu du calendrier.'],
                () => byId('schedule-grade-filter').open),
            step('schedule', '#schedule-grade-filter',
                ['Change the displayed grades', 'Check a grade in the menu and watch the calendar update. You can select more than one.'],
                ['Changer les niveaux affichés', 'Cochez un niveau et observez le calendrier se mettre à jour. Vous pouvez en choisir plusieurs.'],
                (_item, event) => completed || (event?.type === 'change' && !!event.target.closest('[data-schedule-grade]'))),
            step('schedule', '#schedule-grade-filter',
                ['Close the menu', 'Select Done in the grade menu to return to the filtered calendar.'],
                ['Fermer le menu', 'Sélectionnez Terminé dans le menu pour revenir au calendrier filtré.'],
                () => !byId('schedule-grade-filter').open),
            step('schedule', '.cal-item-assessment',
                ['Explore an assessment', 'Hover over, focus, or tap a calendar item to read its details. The calendar now reflects the grades you selected. Finish discards your practice choices.'],
                ['Explorer une évaluation', 'Survolez, sélectionnez au clavier ou touchez un élément pour lire les détails. Le calendrier tient compte de vos niveaux. Terminer efface vos choix d’exercice.'])
        ]]
    ];
    let activeTour;
    let index = 0;
    let target;
    let completed = false;
    let frame;
    let launcher;
    let practiceFrame;
    let loadTimer;

    function renderChoices() {
        const choices = byId('tutorial-choices');
        choices.replaceChildren();
        tours.forEach(([key]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = t(key);
            button.setAttribute('aria-haspopup', 'dialog');
            button.addEventListener('click', () => launchPractice(key, button));
            choices.append(button);
        });
    }

    function launchPractice(key, button) {
        launcher = button;
        dialog.classList.add('tutorial-host');
        dialog.removeAttribute('aria-labelledby');
        dialog.setAttribute('aria-label', t(key));
        const bar = document.createElement('header');
        bar.className = 'tutorial-host-bar';
        const label = document.createElement('p');
        label.textContent = t('tutorial_practice');
        label.setAttribute('role', 'status');
        const exit = document.createElement('button');
        exit.type = 'button';
        exit.textContent = t('tutorial_close');
        exit.addEventListener('click', close);
        bar.append(label, exit);
        practiceFrame = document.createElement('iframe');
        practiceFrame.className = 'tutorial-practice-frame';
        practiceFrame.title = t(key);
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        url.searchParams.set('tutorial-practice', '1');
        url.searchParams.set('tutorial', key);
        url.searchParams.set('language', appState.language);
        practiceFrame.src = url.href;
        dialog.append(bar, practiceFrame);
        dialog.showModal();
        loadTimer = setTimeout(() => { label.textContent = t('tutorial_load_error'); }, 30000);
    }

    function visit(page) {
        if (appState.currentPage !== page) navigateToPage(page, { tutorial: true });
    }

    function visibleTarget(selector) {
        if (selector instanceof Element) return selector;
        return [...document.querySelectorAll(selector)].find(el =>
            el.getClientRects().length && getComputedStyle(el).visibility === 'visible' &&
            el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    }

    function renderStep() {
        const item = activeTour[index];
        completed = false;
        visit(item.page);
        item.enter?.();
        byId('tutorial-progress').textContent = t('tutorial_progress')(t(params.get('tutorial')), index + 1, activeTour.length);
        byId('tutorial-controls').hidden = false;
        update();
        heading.focus({ preventScroll: true });
        panel.scrollTop = 0;
        schedulePlacement(true);
    }

    function update(event) {
        if (!tutorialPractice || !dialog.open) return;
        const item = activeTour[index];
        const text = item[document.documentElement.lang === 'fr' ? 'fr' : 'en'];
        heading.textContent = text[0];
        byId('tutorial-description').textContent = text[1];
        completed = !!item.ready(item, event);
        next.disabled = !completed;
        next.textContent = t(index + 1 === activeTour.length ? 'tutorial_done' : 'tutorial_next');
        const selector = typeof item.selector === 'function' ? item.selector() : item.selector;
        const previous = target;
        target = selector ? visibleTarget(selector) : null;
        byId('tutorial-try').disabled = !target;
        status.textContent = index + 1 === activeTour.length && completed ? '' :
            t(completed ? 'tutorial_action_done' : target ? 'tutorial_action_wait' : 'tutorial_target_missing');
        schedulePlacement(previous !== target);
    }

    function schedulePlacement(scroll = false) {
        if (!dialog.open || !tutorialPractice) return;
        if (scroll && target) target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(placeSpotlight);
    }

    function placeSpotlight() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let rect = target?.getBoundingClientRect();
        const dropdownOpen = target?.matches('details[open]');
        if (dropdownOpen) {
            const menu = target.querySelector('.cal-grade-options')?.getBoundingClientRect();
            if (menu?.height) rect = {
                left: Math.min(rect.left, menu.left), top: Math.min(rect.top, menu.top),
                right: Math.max(rect.right, menu.right), bottom: Math.max(rect.bottom, menu.bottom)
            };
        }
        const left = rect && Math.max(0, rect.left - 5);
        const top = rect && Math.max(0, rect.top - 5);
        const right = rect && Math.min(width, rect.right + 5);
        const bottom = rect && Math.min(height, rect.bottom + 5);
        const fits = rect && right > left && bottom > top;
        spotlight.hidden = !fits;
        dialog.classList.toggle('tutorial-has-target', !!fits);
        if (fits) Object.assign(spotlight.style, {
            left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px`
        });
        const overview = fits && !dropdownOpen && bottom - top > height * .6;
        panel.classList.toggle('tutorial-place-top', !!fits && !overview && height - bottom < top);
        panel.style.maxHeight = fits
            ? `${Math.max(Math.min(300, height * .5), overview ? 0 : Math.max(top, height - bottom) - 22)}px`
            : 'calc(100% - 24px)';
    }

    function close() {
        clearTimeout(loadTimer);
        cancelAnimationFrame(frame);
        dialog.close();
        if (tutorialPractice) {
            window.parent.postMessage('tutorial-close', window.location.origin);
        } else {
            practiceFrame?.remove();
            practiceFrame = null;
            dialog.querySelector('.tutorial-host-bar')?.remove();
            dialog.classList.remove('tutorial-host');
            dialog.removeAttribute('aria-label');
            dialog.setAttribute('aria-labelledby', 'tutorial-heading');
            launcher?.focus();
        }
    }

    next.addEventListener('click', () => {
        if (!completed) return;
        if (index + 1 === activeTour.length) close();
        else { index += 1; renderStep(); }
    });
    byId('tutorial-menu').addEventListener('click', close);
    byId('tutorial-try').addEventListener('click', () => {
        const control = target?.matches('input, select, button, summary, [tabindex]') ? target
            : target?.querySelector('input:not(:disabled), select:not(:disabled), button:not(:disabled):not(.undo-btn), summary, [tabindex="0"]');
        control?.focus();
    });
    dialog.querySelector('.tutorial-close').addEventListener('click', close);
    dialog.addEventListener('click', event => event.stopPropagation());
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    window.addEventListener('keydown', event => {
        if (dialog.open && event.key === 'Escape' && !event.target.closest('details[open]')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
        }
    }, true);
    window.addEventListener('message', event => {
        if (event.origin !== window.location.origin || event.source !== practiceFrame?.contentWindow) return;
        if (event.data === 'tutorial-ready') clearTimeout(loadTimer);
        if (event.data === 'tutorial-close') close();
    });
    window.addEventListener('scroll', () => schedulePlacement(), true);
    window.addEventListener('resize', () => schedulePlacement());
    ['click', 'change', 'input', 'toggle'].forEach(name => {
        document.addEventListener(name, event => {
            if (dialog.contains(event.target) || !tutorialPractice) return;
            requestAnimationFrame(() => update(event));
        }, true);
    });
    new MutationObserver(() => {
        if (tutorialPractice) update();
        else renderChoices();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    // App controls often replace their DOM after a selection.
    new MutationObserver(records => {
        if (records.some(record => !dialog.contains(record.target))) update();
    }).observe(document.body, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['hidden', 'open', 'disabled', 'class'] });
    document.addEventListener('app-ready', () => {
        if (!tutorialPractice) return;
        activeTour = tours.find(([key]) => key === params.get('tutorial'))?.[1];
        if (!activeTour) return;
        document.body.classList.add('tutorial-practice');
        dialog.show();
        renderStep();
        window.parent.postMessage('tutorial-ready', window.location.origin);
    });
    if (tutorialPractice) appState.language = params.get('language') === 'fr' ? 'fr' : 'en';
    renderChoices();
})();
