(() => {
    const byId = id => document.getElementById(id);
    const dialog = byId('app-tutorial');
    const panel = dialog.querySelector('.tutorial-panel');
    const spotlight = dialog.querySelector('.tutorial-spotlight');
    const arrow = dialog.querySelector('.tutorial-arrow');
    const heading = byId('tutorial-heading');
    const next = byId('tutorial-next');
    const finish = byId('tutorial-finish');
    const status = byId('tutorial-status');
    const params = new URL(window.location.href).searchParams;
    const step = (page, selector, en, fr, ready, enter) =>
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
            ['Start the practice pathway', 'Select “Guide me through the process.” The app will build Tier 1 using your selections.'],
            ['Démarrer le parcours d’exercice', 'Sélectionnez « Guidez-moi dans la démarche ». Le palier 1 utilisera vos choix.'],
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
    function prepareChecklist() {
        rememberNode();
        const checks = [...(document.querySelector(liveNode())?.querySelectorAll('.checklist-line input') || [])];
        checks.slice(0, -1).forEach(check => { check.checked = true; });
        checks.at(-1)?.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const tableFilter = '#toolkit-table-head .toolkit-column-filter[data-field="program"]';
    const tableSort = '#toolkit-table-head .toolkit-sort-btn[data-field="name"]';
    const centreDrawer = () => byId('resource-centre-drawer');
    const centreStep = (section, en, fr, interaction) => {
        const tab = () => byId(`rc-tab-${section}`);
        const navigation = step('resource-centre', tab,
            [en[0], 'Select the highlighted section button, or use Next to see what’s inside. On a small screen, these buttons are under Browse sections.'],
            [fr[0], 'Sélectionnez le bouton en surbrillance ou choisissez Suivant pour voir le contenu. Sur un petit écran, ces boutons se trouvent sous Parcourir les sections.'],
            event => event.type === 'click' && tab().contains(event.target));
        Object.assign(navigation, { centreTab: tab, optional: true });
        const content = step('resource-centre', `#${section}-section`, en, fr, null, () => {
            closeResourceCentreDrawer();
            if (tab().getAttribute('aria-selected') !== 'true') selectResourceCentrePage(section);
            byId(`${section}-section`).scrollTop = 0;
        });
        return [navigation, { ...content, centreContent: true, interaction }];
    };
    const tours = [
        ['nav_flowchart', [
            ...setup,
            step('flowchart', flowTarget,
                ['Review the checklist', 'The other items are checked for practice. Check the last item, then select Continue to Results.'],
                ['Vérifier les principes', 'Les autres éléments sont déjà cochés pour l’exercice. Cochez le dernier, puis poursuivez vers les résultats.'],
                flowChanged, prepareChecklist),
            step('flowchart', () => `${liveNode()} .decision-grid`,
                ['Make a practice decision', 'Read the question and choose an answer in the app. This is only an example: use actual learner evidence outside practice. Watch the pathway move to the next step.'],
                ['Prendre une décision d’exercice', 'Lisez la question et choisissez une réponse dans l’application. Il s’agit d’un exemple : hors exercice, utilisez les données de l’élève. Le parcours passera à l’étape suivante.'],
                flowChanged, rememberNode),
            step('flowchart', () => byId('visual-flowchart-viewport') ? '#visual-flowchart-viewport' : '#journey-map',
                ['See your pathway in action', 'The pathway now shows your decisions and the next step or outcome. On larger screens, drag the visual map to explore. Finish discards this practice session, not your saved work.'],
                ['Voir le parcours en action', 'Le parcours affiche vos décisions et la prochaine étape ou le résultat. Sur grand écran, faites glisser la carte pour l’explorer. Terminer efface seulement cet exercice, et non vos données.'],
                null, () => openVisualFlowchartModal())
        ]],
        ['nav_interventions', [
            step('interventions', '#menu-type-filter',
                ['Choose a resource type', 'In the regular app, the Toolkit follows your teaching program and can prefill your grade. This practice starts fresh. Choose any resource type to reveal the next filters.'],
                ['Choisir un type de ressource', 'Dans l’application, la Boîte à outils suit votre programme et peut reprendre votre niveau. Cet exercice repart de zéro. Choisissez un type de ressource pour afficher les filtres suivants.'],
                () => !!menuState.resourceType),
            step('interventions', '#menu-pillar-filter',
                ['Open the skills menu', 'Select the Literacy pillars heading to open its real dropdown.'],
                ['Ouvrir le menu des habiletés', 'Sélectionnez le titre des piliers de la littératie pour ouvrir le menu.'],
                () => byId('menu-pillar-filter').open),
            step('interventions', '#menu-pillar-filter',
                ['Select a literacy pillar', 'Check one or more skills in the open menu, then select Done in that menu.'],
                ['Choisir un pilier', 'Cochez une ou plusieurs habiletés dans le menu ouvert, puis sélectionnez Terminé dans ce menu.'],
                () => !byId('menu-pillar-filter').open && getMenuPillars().length > 0),
            step('interventions', '#filter-tier-chips',
                ['Choose a tier', 'Select a tier button. Notice how completing the required choices makes Search available.'],
                ['Choisir un palier', 'Sélectionnez un bouton de palier. Une fois les choix obligatoires remplis, la recherche sera disponible.'],
                () => !!menuState.tier),
            step('interventions', '#menu-search-submit-btn',
                ['Run the search', 'Select Search in the app to see real matching resources.'],
                ['Lancer la recherche', 'Sélectionnez Rechercher dans l’application pour afficher les ressources correspondantes.'],
                () => menuUiState.view === 'results'),
            step('interventions', '#toolkit-view-toggle',
                ['Review results or try the table', 'The app shows matches for your choices. Review them, then switch to All resources to browse the catalogue as a table.'],
                ['Examiner les résultats ou essayer le tableau', 'Consultez les résultats, puis activez Toutes les ressources pour parcourir le catalogue sous forme de tableau.'],
                () => byId('toolkit-view-toggle').getAttribute('aria-checked') === 'true'),
            step('interventions', `${tableFilter} > summary`,
                ['Open a column filter', 'Use the arrow beside a column name to filter the table. Open the Program filter to try it.'],
                ['Ouvrir un filtre de colonne', 'La flèche à côté du nom d’une colonne permet de filtrer le tableau. Essayez le filtre Programme.'],
                () => document.querySelector(tableFilter).open),
            step('interventions', tableFilter,
                ['Filter by program', 'Check a program to see the rows update, then select Done.'],
                ['Filtrer par programme', 'Cochez un programme pour mettre à jour les lignes, puis sélectionnez Terminé.'],
                () => !document.querySelector(tableFilter).open && !!toolkitTableState.filters.program?.length),
            step('interventions', tableSort,
                ['Sort the table', 'Select the Resource column name to reverse the sort order. You can also sort by Resource Type outside practice.'],
                ['Trier le tableau', 'Sélectionnez le titre de la colonne Ressource pour inverser l’ordre de tri. Hors exercice, vous pouvez aussi trier par type de ressource.'],
                () => toolkitTableState.direction === 'descending'),
            step('interventions', tableSort,
                ['Review the sorted results', 'The arrow shows the sort direction. Select Resource again to switch it, or select Finish to leave practice.'],
                ['Consulter les résultats triés', 'La flèche indique le sens du tri. Sélectionnez de nouveau Ressource pour l’inverser, ou Terminer pour quitter l’exercice.'])
        ]],
        ['nav_schedule', [
            step('schedule', '#schedule-grade-filter',
                ['Open the grade filter', 'In the regular app, the schedule follows your teaching program and can start with your selected grade. This practice shows all grades. Open the grade menu to try the filter.'],
                ['Ouvrir le filtre des niveaux', 'Dans l’application, le calendrier suit votre programme et peut afficher le niveau choisi. Cet exercice montre tous les niveaux. Ouvrez le menu pour essayer le filtre.'],
                () => byId('schedule-grade-filter').open),
            step('schedule', '#schedule-grade-filter',
                ['Change the displayed grades', 'Check a grade in the menu and watch the calendar update. You can select more than one.'],
                ['Changer les niveaux affichés', 'Cochez un niveau et observez le calendrier se mettre à jour. Vous pouvez en choisir plusieurs.'],
                event => event.type === 'change' && !!event.target.closest('[data-schedule-grade]')),
            step('schedule', '#schedule-grade-filter',
                ['Close the menu', 'Select Done in the grade menu to return to the filtered calendar.'],
                ['Fermer le menu', 'Sélectionnez Terminé dans le menu pour revenir au calendrier filtré.'],
                () => !byId('schedule-grade-filter').open),
            step('schedule', '.cal-item-assessment',
                ['Explore an assessment', 'Hover over, focus, or tap a calendar item to read its details. The calendar now reflects the grades you selected. Finish discards your practice choices.'],
                ['Explorer une évaluation', 'Survolez, sélectionnez au clavier ou touchez un élément pour lire les détails. Le calendrier tient compte de vos niveaux. Terminer efface vos choix d’exercice.'])
        ]],
        ['tutorial_centre_settings', [
            ...centreStep('favourites',
                ['My Saved Items', 'Find saved flowchart sessions under Sessions and bookmarked teaching materials under Resources. This practice copy starts empty. You can also move between sections using the Previous and Next buttons below the content.'],
                ['Mes éléments enregistrés', 'Retrouvez les parcours enregistrés sous Séances et le matériel mis en favori sous Ressources. Cette copie d’exercice est vide. Vous pouvez aussi changer de section à l’aide des boutons Précédent et Suivant sous le contenu.']),
            ...centreStep('scores',
                ['Scores & Percentiles', 'Use this guide to understand scores from literacy assessments. It explains how percentile ranks compare a result with a reference group and how to interpret standard scores.'],
                ['Scores et rangs centiles', 'Ce guide aide à comprendre les résultats des évaluations en littératie. Il explique comment les rangs centiles situent un résultat par rapport à un groupe de référence et comment interpréter les scores standardisés.']),
            ...centreStep('pillars',
                ['Literacy Pillars', 'Look up skills such as phonological awareness, phonics, fluency, and vocabulary. Open any skill to read its definition, or select Next to continue.'],
                ['Piliers de la littératie', 'Consultez les définitions de notions comme la conscience phonologique, la phonétique, la fluidité et le vocabulaire. Ouvrez une notion pour lire sa définition ou sélectionnez Suivant.'],
                '.pillar-definition summary'),
            ...centreStep('resources',
                ['Division resources', 'Find the division’s screening and progress-monitoring overview, English and French learning progressions, and structured literacy scope and sequence documents for French Immersion.'],
                ['Ressources de la division', 'Retrouvez la vue d’ensemble du dépistage et du suivi des progrès, les progressions des apprentissages en anglais et en français et les séquences d’enseignement de la littératie structurée en immersion française.']),
            ...centreStep('tutorials',
                ['App tutorials', 'Return here to practise the Flowchart, Literacy Toolkit, or Assessment Schedule. Each tutorial opens a separate copy of the app, so you can experiment without changing saved work.'],
                ['Tutoriels de l’application', 'Revenez ici pour vous exercer avec l’organigramme, la boîte à outils ou le calendrier d’évaluation. Chaque tutoriel ouvre une copie distincte de l’application sans modifier vos données enregistrées.']),
            ...centreStep('faq',
                ['Frequently asked questions', 'Search by keyword or browse categories for common questions about screening, scoring, and progress monitoring. Try a search if you like, or select Next.'],
                ['Foire aux questions', 'Faites une recherche par mot-clé ou parcourez les catégories pour trouver des réponses sur le dépistage, la cotation et le suivi des progrès. Essayez la recherche ou sélectionnez Suivant.'],
                '#faq-search-input'),
            ...centreStep('about',
                ['About this app', 'Read why the division created this guide and how its screening and progress-monitoring schedule supports instructional planning.'],
                ['À propos de l’application', 'Découvrez pourquoi la division a créé ce guide et comment son calendrier de dépistage et de suivi des progrès aide à planifier l’enseignement.']),
            step('resource-centre', () => visibleTarget('.nav-settings')
                || (appState.mobileMenuOpen ? '.mobile-nav-item[data-page="settings"]' : '.mobile-menu-btn'),
                ['Open Settings', 'Select Settings in the navigation. On a smaller screen, open the navigation menu first.'],
                ['Ouvrir les paramètres', 'Sélectionnez Paramètres dans la navigation. Sur un petit écran, ouvrez d’abord le menu de navigation.'],
                () => appState.currentPage === 'settings'),
            step('settings', '.settings-theme-toggle',
                ['Try dark mode', 'Switch between light and dark as often as you like. When you’re ready, select Next. This only changes your practice view, not your saved preference.'],
                ['Essayer le mode sombre', 'Passez du mode clair au mode sombre autant de fois que vous le souhaitez. Quand vous avez terminé, sélectionnez Suivant. Seul l’affichage de l’exercice change, pas votre préférence enregistrée.']),
            step('settings', '#settings-visual-flowchart-layout',
                ['Choose a flowchart layout', 'This setting controls whether pathway cards stay on one row or shift up or down based on your decision. You can preview a selection here or leave it unchanged.'],
                ['Choisir la disposition de l’organigramme', 'Ce réglage permet de garder les cartes sur une seule rangée ou de déplacer la carte suivante vers le haut ou le bas selon votre décision. Vous pouvez essayer un choix ou laisser le réglage tel quel.']),
            step('settings', '#settings-transfer-title',
                ['Transfer saved data', 'To move sessions, progress, and bookmarks to another device, email yourself a backup link. On the other device, paste the link in Settings and review the preview before replacing saved data. You don’t need to send or restore anything here.'],
                ['Transférer les données enregistrées', 'Pour déplacer vos séances, votre progression et vos favoris, envoyez-vous un lien de sauvegarde. Sur l’autre appareil, collez le lien dans les paramètres et vérifiez l’aperçu avant de remplacer les données. Rien à envoyer ni à restaurer ici.']),
            step('settings', '#settings-reset-title',
                ['Reset saved data', 'This option clears saved work and preferences on this device. Use it only when you want to start fresh. This tutorial won’t reset anything.'],
                ['Réinitialiser les données enregistrées', 'Cette option efface le travail enregistré et les préférences sur cet appareil. Utilisez-la seulement pour repartir de zéro. Cet exercice ne réinitialise rien.'])
        ]]
    ];
    const previews = {
        nav_flowchart: 'flowchart',
        nav_interventions: 'literacy-toolkit',
        nav_schedule: 'assessment-schedule',
        tutorial_centre_settings: 'resource-centre'
    };
    let activeTour;
    let index = 0;
    let target;
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
            const image = document.createElement('img');
            image.src = `images/tutorials/${previews[key]}.webp`;
            image.alt = '';
            image.width = 640;
            image.height = 360;
            image.loading = 'lazy';
            const label = document.createElement('span');
            label.className = 'tutorial-card-label';
            label.textContent = t(key);
            button.append(image, label);
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
        return (selector instanceof Element ? [selector] : [...document.querySelectorAll(selector)]).find(el =>
            isVisible(el) && (el.getBoundingClientRect().width || el.matches('details[open]')));
    }

    const isVisible = el => el.getClientRects().length && getComputedStyle(el).visibility === 'visible';

    function renderStep() {
        const item = activeTour[index];
        visit(item.page);
        item.enter?.();
        update();
        panel.scrollTop = 0;
        schedulePlacement(true);
    }

    function showCentreNavigation(item) {
        const tab = item.centreTab();
        const drawer = centreDrawer();
        // Keep the real mobile drawer below the tutorial callout instead of making it modal.
        if (drawer.contains(tab) && !drawer.open) drawer.show();
        byId('resource-centre-browse').setAttribute('aria-expanded', String(drawer.open));
        tab.tabIndex = 0;
    }

    function update(event) {
        if (!tutorialPractice || !dialog.open) return;
        const item = activeTour[index];
        if (event && item.ready?.(event)) {
            index += 1;
            renderStep();
            if (item.centreTab) next.focus({ preventScroll: true });
            return;
        }
        if (item.centreTab) showCentreNavigation(item);
        dialog.classList.toggle('tutorial-centre-content', !!item.centreContent);
        byId('tutorial-progress').textContent = t('tutorial_progress')(t(params.get('tutorial')), index + 1, activeTour.length);
        const text = item[document.documentElement.lang === 'fr' ? 'fr' : 'en'];
        if (heading.textContent !== text[0]) heading.textContent = text[0];
        const description = byId('tutorial-description');
        if (description.textContent !== text[1]) description.textContent = text[1];
        const last = index === activeTour.length - 1;
        next.hidden = params.get('tutorial') !== 'tutorial_centre_settings' || last || (!!item.ready && !item.optional);
        finish.hidden = !last;
        const selector = typeof item.selector === 'function' ? item.selector() : item.selector;
        const previous = target;
        target = selector ? visibleTarget(selector) : null;
        status.hidden = !item.ready || !!target;
        if (!status.hidden) status.textContent = t('tutorial_target_missing');
        schedulePlacement(previous !== target);
    }

    function schedulePlacement(scroll = false) {
        if (!dialog.open || !tutorialPractice) return;
        if (scroll && target) {
            const anchor = target.matches('details[open]') ? target.querySelector('summary') : target;
            anchor?.scrollIntoView({ block: activeTour[index].centreContent ? 'nearest' : 'center', inline: 'nearest', behavior: 'instant' });
        }
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(placeSpotlight);
    }

    function placeSpotlight() {
        const centreContent = activeTour[index].centreContent;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const margin = 12;
        const gap = 14;
        const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
        let rect = target?.getBoundingClientRect();
        const dropdownOpen = target?.matches('details[open]');
        if (dropdownOpen) {
            rect = target.querySelector('summary')?.getBoundingClientRect() || rect;
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
        const preferredWidth = Math.min(352, width - margin * 2);
        const maxHeight = height - margin * 2;
        panel.style.width = `${preferredWidth}px`;
        panel.style.maxHeight = `${maxHeight}px`;
        const panelHeight = panel.getBoundingClientRect().height;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const above = top - gap - margin;
        const below = height - bottom - gap - margin;
        const side = width - right >= left ? 'right' : 'left';
        const sideRoom = (side === 'right' ? width - right : left) - gap - margin;
        let x = clamp(centerX - preferredWidth / 2, margin, width - margin - preferredWidth);
        let y;
        let point;
        if (fits && Math.max(above, below) >= panelHeight) {
            const placeBelow = below >= panelHeight;
            y = placeBelow ? bottom + gap : top - gap - panelHeight;
            point = [clamp(centerX, x + 20, x + preferredWidth - 20), placeBelow ? y : y + panelHeight, placeBelow ? 45 : 225];
        } else if (fits && sideRoom >= 248) {
            const panelWidth = Math.min(preferredWidth, sideRoom);
            panel.style.width = `${panelWidth}px`;
            const actualHeight = panel.getBoundingClientRect().height;
            x = side === 'right' ? right + gap : left - gap - panelWidth;
            y = clamp(centerY - actualHeight / 2, margin, height - margin - actualHeight);
            point = [side === 'right' ? x : x + panelWidth, clamp(centerY, y + 20, y + actualHeight - 20), side === 'right' ? -45 : 135];
        } else if (fits && centreContent) {
            // Dock below the readable part of the preview and leave room to scroll past the callout.
            panel.style.maxHeight = `${Math.floor(height * .43)}px`;
            y = height - margin - panel.getBoundingClientRect().height;
        } else {
            // Dock at the roomier edge instead of compressing the caption to fit a gap.
            if (!fits) x = (width - preferredWidth) / 2;
            y = fits && above > below ? margin : height - margin - panelHeight;
        }
        Object.assign(panel.style, { left: `${x}px`, top: `${y}px` });
        if (centreContent && target) {
            const inset = fits && !point ? Math.max(0, bottom - y) : 0;
            target.style.setProperty('--tutorial-content-inset', `${inset}px`);
        }
        panel.tabIndex = panel.scrollHeight > panel.clientHeight ? 0 : -1;
        arrow.hidden = !point;
        if (point) Object.assign(arrow.style, {
            left: `${point[0]}px`, top: `${point[1]}px`, rotate: `${point[2]}deg`
        });
    }

    function close() {
        clearTimeout(loadTimer);
        cancelAnimationFrame(frame);
        dialog.close();
        if (tutorialPractice) {
            if (activeTour[index].centreTab) closeResourceCentreDrawer();
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
        if (next.hidden) return;
        index += 1;
        renderStep();
        (next.hidden ? (finish.hidden ? dialog.querySelector('.tutorial-close') : finish) : next).focus({ preventScroll: true });
    });
    finish.addEventListener('click', close);
    dialog.querySelector('.tutorial-close').addEventListener('click', close);
    dialog.addEventListener('click', event => event.stopPropagation());
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    function allowsInteraction(element) {
        if (dialog.contains(element)) return true;
        if (!target?.contains(element)) return false;
        const item = activeTour[index];
        if (item.centreContent) return element === target || !!(item.interaction && element.closest(item.interaction));
        // The final map is for viewing and panning, not starting another branch.
        return !target.matches('#visual-flowchart-viewport, #journey-map') ||
            !element.closest('a, button, input, select, summary');
    }

    function blockInteraction(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    for (const name of ['pointerdown', 'mousedown', 'click', 'auxclick', 'contextmenu']) {
        window.addEventListener(name, event => {
            if (tutorialPractice && dialog.open && !allowsInteraction(event.target)) blockInteraction(event);
        }, true);
    }

    window.addEventListener('keydown', event => {
        if (!dialog.open) return;
        if (event.key === 'Escape' && !event.target.closest('details[open]')) {
            blockInteraction(event);
            close();
        } else if (tutorialPractice && activeTour[index].centreTab && target?.contains(event.target) &&
            ['Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            blockInteraction(event);
        } else if (tutorialPractice && event.key === 'Tab') {
            const focusable = [...document.querySelectorAll('a[href], button, input, select, summary, [tabindex]')]
                .filter(el => el.tabIndex >= 0 && !el.disabled && !el.closest('[inert]') && isVisible(el) && allowsInteraction(el));
            const current = focusable.indexOf(document.activeElement);
            const next = current === -1 ? (event.shiftKey ? focusable.length - 1 : 0)
                : (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
            event.preventDefault();
            event.stopImmediatePropagation();
            focusable[next]?.focus();
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
            const actionIndex = index;
            requestAnimationFrame(() => {
                if (actionIndex === index) update(event);
            });
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
