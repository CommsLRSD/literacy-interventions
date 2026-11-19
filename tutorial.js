(() => {
    const step = (page, selector, en, fr, options = {}) => ({ page, selector, en, fr, ...options });
    const sections = [
        ['tutorial_setup', [
            step('home', '#home-program-select', [
                'Choose your teaching program',
                'Start at Home (select the app logo). Choose English or French Immersion. This determines which screeners, resources and schedule you see. Changing programs with a pathway in progress can prompt you to restart.'
            ], [
                'Choisir le programme d’enseignement',
                'Commencez à l’accueil (sélectionnez le logo). Choisissez le programme anglais ou l’immersion française. Ce choix détermine les outils de dépistage, les ressources et le calendrier. Si un parcours est en cours, un changement de programme peut demander de recommencer.'
            ]),
            step('home', '#home-display-language, #top-language-select', [
                'Set the display language',
                'In French Immersion, choose English or Français for the app interface. This is separate from the teaching program. On phones, the menu also contains program and language settings.'
            ], [
                'Choisir la langue d’affichage',
                'En immersion française, affichez l’interface en français ou en anglais. Ce choix est indépendant du programme d’enseignement. Sur téléphone, ces réglages se trouvent aussi dans le menu.'
            ], { example: ['Display Language: English | Français', 'Langue d’affichage : English | Français'] }),
            step('home', '#home-screener-select', [
                'Select a screener',
                'After choosing a program, select the assessment you’re using. The pathway uses this to show relevant measures and resources. Use the optional DIBELS reference below if you need a refresher.'
            ], [
                'Choisir un outil de dépistage',
                'Après le programme, choisissez l’évaluation que vous utilisez. Le parcours affiche les mesures et les ressources pertinentes. Consultez le rappel facultatif sur DIBELS ci-dessous au besoin.'
            ], { dibels: true }),
            step('home', '#home-grade-select', [
                'Select the grade',
                'Choose the teaching grade to tailor the pathway and related resources. Your choices can also prefill filters elsewhere in the app.'
            ], [
                'Choisir le niveau scolaire',
                'Choisissez le niveau d’enseignement pour adapter le parcours et les ressources. Vos choix peuvent aussi préremplir des filtres ailleurs dans l’application.'
            ]),
            step('home', '#home-start-btn, #home-resume-btn', [
                'Start, continue or reset',
                'Select Start to begin at Tier 1. If a pathway is saved, Continue picks up where you left off. The adjacent reset button clears flowchart progress and asks for confirmation; use it only if you mean to start over.'
            ], [
                'Démarrer, reprendre ou réinitialiser',
                'Sélectionnez le bouton de démarrage pour commencer au palier 1. Si un parcours est enregistré, reprenez là où vous vous êtes arrêté. Le bouton de réinitialisation adjacent efface la progression après confirmation.'
            ]),
            step('home', '.home-resource-shortcut', [
                'Skip straight to teaching resources',
                'Select this shortcut to open the Literacy Toolkit without starting a pathway. Use the side navigation (or menu on a phone) to switch to the Assessment Schedule, Resource Centre or Settings.'
            ], [
                'Accéder directement aux ressources pédagogiques',
                'Ce raccourci ouvre la Boîte à outils sans démarrer de parcours. Utilisez le menu latéral (ou le menu sur téléphone) pour ouvrir le calendrier, le Centre de ressources ou les paramètres.'
            ])
        ]],
        ['nav_flowchart', [
            step('home', '#journey-overview-title', [
                'Understand the three tiers',
                'Tier 1 is classroom instruction and screening for all learners. Tier 2 adds targeted support. Tier 3 adds intensive, individualized support. The pathway uses classroom evidence and screening results to help you decide what to do next.'
            ], [
                'Comprendre les trois paliers',
                'Le palier 1 couvre l’enseignement en classe et le dépistage pour tous. Le palier 2 ajoute un soutien ciblé. Le palier 3 ajoute un soutien intensif et personnalisé. Le parcours s’appuie sur les observations en classe et les résultats de dépistage.'
            ]),
            step('flowchart', '.tier-tab[aria-selected="true"], #flowchart-tier-name-value', [
                'Check the active tier',
                'Use the tier controls to review the available tiers. Read the entry criteria before moving up; follow the transition offered at the end of a tier when it matches the learner’s needs.'
            ], [
                'Vérifier le palier actif',
                'Les commandes de palier permettent de consulter les paliers offerts. Lisez les critères d’entrée avant de passer au suivant. Suivez la transition proposée si elle répond aux besoins de l’élève.'
            ], { example: ['Tier 1 → Tier 2 → Tier 3', 'Palier 1 → Palier 2 → Palier 3'] }),
            step('flowchart', '#journey-step-slot h3, #journey-step-slot h4, #journey-map-title', [
                'Work through the current step',
                'Read the instructions, complete any checklist items, then select an answer or continue. Use actual learner evidence to answer decision questions. Some steps ask you to select an assessment, subtest or intervention; open the linked materials as needed.'
            ], [
                'Suivre l’étape en cours',
                'Lisez les consignes, complétez les éléments de la liste de vérification, puis choisissez une réponse ou poursuivez. Appuyez vos décisions sur les données de l’élève. Certaines étapes demandent de choisir une évaluation, un sous-test ou une intervention; ouvrez les ressources au besoin.'
            ], { example: ['Read the step → Review the checklist → Continue', 'Lire l’étape → Vérifier les éléments → Continuer'] }),
            step('flowchart', '#carousel-prev-btn, .journey-map-item.journey-map-done', [
                'Review or change an earlier decision',
                'Use Back one step or choose a completed step in your decision history. A changed answer can replace the decisions that followed it. When you reach an outcome, review the summary and any recommended monitoring or next tier.'
            ], [
                'Revoir ou modifier une décision précédente',
                'Revenez d’une étape ou choisissez une étape terminée dans l’historique. Une réponse modifiée peut remplacer les décisions suivantes. À la fin, examinez le résumé ainsi que le suivi ou le prochain palier recommandé.'
            ], { example: ['← Back one step', '← Revenir d’une étape'] }),
            step('flowchart', '#layout-toggle-group', [
                'Switch pathway views',
                'Use the view controls to switch between the decision summary and the visual map where offered. In the map, drag to move around, use + or − to zoom, and use Fit to show the pathway. Use the full-screen button on supported devices.'
            ], [
                'Changer de vue du parcours',
                'Les commandes de vue permettent de passer du résumé des décisions à la carte visuelle lorsqu’elle est offerte. Faites glisser la carte pour la déplacer, utilisez + ou − pour zoomer et ajustez la vue au besoin. Le plein écran dépend de l’appareil.'
            ], { example: ['Decision summary | Visual pathway | −  +  Fit', 'Résumé des décisions | Parcours visuel | −  +  Ajuster'] }),
            step('flowchart', '#pathway-sessions-toggle', [
                'Read session notes and pick up later',
                'Session notes collect decisions and resources from your pathway. Use Return to my next step to resume. To find an earlier session, go to Resource Centre → My Saved Items. Sessions are saved on this device.'
            ], [
                'Consulter les notes et reprendre plus tard',
                'Les notes de séance regroupent les décisions et les ressources du parcours. Utilisez la commande de retour à la prochaine étape pour reprendre. Les séances précédentes se trouvent dans Centre de ressources → Mes éléments enregistrés. Elles sont enregistrées sur cet appareil.'
            ], { example: ['Session notes', 'Notes de séance'] })
        ]],
        ['nav_interventions', [
            step('interventions', '#menu-type-filter', [
                'Choose a resource type',
                'The step-by-step search narrows the Toolkit to what you need. Start by choosing the kind of resource you’re looking for. If you land on results from an earlier search, New search takes you back to the full form.'
            ], [
                'Choisir un type de ressource',
                'La recherche étape par étape réduit la liste aux ressources voulues. Commencez par choisir leur type. Si des résultats précédents s’affichent, Nouvelle recherche vous ramène au formulaire.'
            ]),
            step('interventions', '#menu-pillar-filter > summary', [
                'Pick the reading skills to target',
                'Open the literacy pillars menu and select one or more skills. If a tier is requested, choose the level of support. Select “What do these pillars mean?” for definitions.'
            ], [
                'Préciser les habiletés de lecture à travailler',
                'Ouvrez le menu des piliers et sélectionnez une ou plusieurs habiletés. Choisissez un palier si demandé. Utilisez le bouton d’aide sur les piliers pour consulter les définitions.'
            ], { example: ['Literacy pillars ▾', 'Piliers de la littératie ▾'] }),
            step('interventions', '.filter-advanced > summary', [
                'Refine results with advanced filters',
                'When results are shown, expand Advanced filters to narrow them by screener, subtest, grade or keyword. You can also edit criteria from the results bar without starting over.'
            ], [
                'Affiner les résultats avec les filtres avancés',
                'Lorsque les résultats sont affichés, ouvrez les filtres avancés pour préciser l’outil de dépistage, le sous-test, le niveau scolaire ou un mot-clé. La barre de critères permet aussi de modifier la recherche sans recommencer.'
            ], { results: true, example: ['Advanced filters ▾', 'Filtres avancés ▾'] }),
            step('interventions', '#menu-search-submit-btn', [
                'Run a search',
                'Select Search once the required choices are complete. Read the result cards and their notes before opening a resource. Use Clear Filters to remove your choices and begin again.'
            ], [
                'Lancer une recherche',
                'Sélectionnez Rechercher une fois les choix obligatoires remplis. Lisez les fiches et les notes avant d’ouvrir une ressource. Effacez les filtres pour repartir de zéro.'
            ]),
            step('interventions', '#toolkit-view-toggle', [
                'Switch to the All resources table',
                'Turn on the table switch to browse without the step-by-step form. The table starts with your teaching program and keeps its filters separate from your guided search.'
            ], [
                'Passer au tableau de toutes les ressources',
                'Activez le tableau pour parcourir les ressources sans utiliser le formulaire détaillé. Il tient compte du programme d’enseignement et conserve des filtres distincts de la recherche guidée.'
            ]),
            step('interventions', '#toolkit-table-search', [
                'Search, filter and sort the table',
                'Type a keyword to narrow the list. Use the column arrows for filters and recommendation options, or select Resource or Resource Type to sort. Clear Filters resets the table.'
            ], [
                'Rechercher, filtrer et trier le tableau',
                'Entrez un mot-clé pour réduire la liste. Utilisez les flèches des colonnes pour filtrer ou régler les recommandations. Sélectionnez Ressource ou Type de ressource pour trier. Effacez les filtres pour réinitialiser le tableau.'
            ], { table: true }),
            step('interventions', '#toolkit-table-body .favourite-toggle', [
                'Bookmark a resource',
                'Use the bookmark button on a resource card or in the table to save it. Select it again to remove the bookmark. Saved resources appear in Resource Centre → My Saved Items.'
            ], [
                'Mettre une ressource en favori',
                'Utilisez le bouton de favori sur une fiche ou dans le tableau pour enregistrer la ressource. Sélectionnez-le de nouveau pour la retirer. Retrouvez-la dans Centre de ressources → Mes éléments enregistrés.'
            ], { table: true, example: ['Bookmark resource', 'Mettre la ressource en favori'] })
        ]],
        ['nav_schedule', [
            step('schedule', '#schedule-grade-filter > summary', [
                'Filter the assessment schedule by grade',
                'The schedule follows your teaching program. Open the grade menu, check one or more grades, then select Done. Choose All grades to see the whole program.'
            ], [
                'Filtrer le calendrier par niveau scolaire',
                'Le calendrier suit votre programme d’enseignement. Ouvrez le menu, cochez un ou plusieurs niveaux, puis sélectionnez Terminé. Choisissez Tous les niveaux pour réafficher le programme complet.'
            ]),
            step('schedule', '.cal-item-assessment', [
                'Read the timeline and open details',
                'Follow the months across the desktop calendar or down the phone view. Hover over, focus, or tap an assessment or reporting item for details. The bars show when activities are scheduled, not whether you completed them.'
            ], [
                'Lire le calendrier et ouvrir les détails',
                'Les mois se lisent horizontalement sur ordinateur et verticalement sur téléphone. Survolez, sélectionnez au clavier ou touchez une évaluation ou un rapport pour les détails. Les barres indiquent les périodes prévues et non les activités terminées.'
            ]),
            step('schedule', '#calendar-legend .legend-title', [
                'Use the calendar legend',
                'Match the colours and symbols to the legend to distinguish assessments, intervention periods and reporting dates. If a different program is needed, change it in Home or the navigation controls.'
            ], [
                'Utiliser la légende du calendrier',
                'Comparez les couleurs et les symboles à la légende pour distinguer les évaluations, les périodes d’intervention et les dates de transmission des résultats. Changez de programme à l’accueil ou dans le menu au besoin.'
            ])
        ]],
        ['nav_resource_centre', [
            step('favourites', '#resource-centre-browse, .resource-centre-navigation .resource-centre-nav-caption', [
                'Browse the Resource Centre',
                'Choose a topic from the section list. On smaller screens, open Browse sections first. You can also use Previous and Next at the bottom of the reader.'
            ], [
                'Parcourir le Centre de ressources',
                'Choisissez un sujet dans la liste des sections. Sur petit écran, ouvrez d’abord le menu des sections. Vous pouvez aussi utiliser Précédent et Suivant au bas du volet de lecture.'
            ]),
            step('favourites', '#saved-sessions-title', [
                'Find saved sessions',
                'My Saved Items keeps your 30 most recent sessions on this device. Open a session to review its notes and resources or resume the pathway. Use the session’s rename or delete controls to organize the list.'
            ], [
                'Retrouver les séances enregistrées',
                'Mes éléments enregistrés conserve les 30 séances les plus récentes sur cet appareil. Ouvrez une séance pour consulter ses notes et ses ressources ou reprendre le parcours. Utilisez les commandes de renommage et de suppression pour organiser la liste.'
            ]),
            step('favourites', '#saved-resources-title', [
                'Find bookmarked resources',
                'Under Resources, open a saved item’s materials or remove its bookmark. An empty list means no resources have been bookmarked yet.'
            ], [
                'Retrouver les ressources favorites',
                'Sous Ressources, ouvrez le matériel associé à un élément enregistré ou retirez le favori. Une liste vide signifie qu’aucune ressource n’a encore été ajoutée.'
            ]),
            step('scores', '#resource-centre-reader-title', [
                'Interpret scores and percentiles',
                'Open Scores & Percentiles for guidance on interpreting screening results and comparing percentile ranks with standard scores. Use the explanations alongside your classroom evidence.'
            ], [
                'Interpréter les scores et les rangs centiles',
                'Consultez la section sur les scores et les centiles pour interpréter les résultats du dépistage et distinguer rangs centiles et scores standardisés. Appuyez-vous aussi sur vos observations en classe.'
            ], { dibels: true }),
            step('pillars', '#pillars-section details > summary, #resource-centre-reader-title', [
                'Look up literacy terms',
                'In Literacy Pillars, expand a heading to read the definition. Open several to compare. You can also reach the definitions from the Toolkit’s pillar help button.'
            ], [
                'Consulter les termes de littératie',
                'Dans les piliers de la littératie, ouvrez un titre pour lire la définition. Ouvrez-en plusieurs pour les comparer. Le bouton d’aide de la Boîte à outils mène aussi à ces définitions.'
            ]),
            step('resources', '#resource-centre-reader-title', [
                'Open reference materials',
                'Resources lists supporting materials by topic. Select the relevant link to open the source. These references are separate from the teaching materials you filter in the Toolkit.'
            ], [
                'Ouvrir les documents de référence',
                'La section Ressources regroupe des documents d’appui par sujet. Sélectionnez un lien pour ouvrir la source. Ces références sont distinctes des ressources pédagogiques de la Boîte à outils.'
            ]),
            step('faq', '#faq-search-input', [
                'Find answers in the FAQ',
                'Search for a term or select a category. Select a question to expand its answer, and use the page controls if more questions are available. Clear the search to see more topics.'
            ], [
                'Trouver une réponse dans la FAQ',
                'Recherchez un terme ou choisissez une catégorie. Sélectionnez une question pour afficher sa réponse. Utilisez les commandes de pagination s’il y a d’autres questions. Effacez la recherche pour voir plus de sujets.'
            ], { dibels: true }),
            step('about', '#resource-centre-reader-title', [
                'Learn why the app was built',
                'About explains the background for literacy screening and intervention in LRSD. For feedback, use the feedback link in the app. To revisit these tours, choose App tutorials under Help & Background.'
            ], [
                'Comprendre le contexte de l’application',
                'La section À propos explique le contexte du dépistage et de l’intervention en littératie à la LRSD. Utilisez le lien de rétroaction pour transmettre vos commentaires. Pour revoir les visites, choisissez Tutoriels de l’application dans la section d’aide.'
            ])
        ]],
        ['settings_title', [
            step('settings', '#settings-dark-mode + span, #settings-dark-mode', [
                'Change the appearance',
                'Turn Dark mode on for darker backgrounds or off for the light appearance. This preference is saved on this device.'
            ], [
                'Changer l’apparence',
                'Activez le mode sombre pour des arrière-plans plus foncés ou désactivez-le pour revenir à l’affichage clair. Cette préférence est enregistrée sur cet appareil.'
            ]),
            step('settings', '#settings-visual-flowchart-layout', [
                'Choose a visual pathway layout',
                'Pick the layout you find easiest to follow. One layout keeps cards in a row; the other lets the next card move up or down based on the decision.'
            ], [
                'Choisir la disposition du parcours visuel',
                'Choisissez l’affichage le plus facile à suivre. Une disposition garde les fiches sur une rangée; l’autre place la fiche suivante plus haut ou plus bas selon la décision.'
            ]),
            step('settings', '#transfer-email', [
                'Send your saved data to yourself',
                'On the original device, choose Email my saved data. Review the draft that opens in your email app, then send it to yourself. The app does not send the draft automatically. Treat the transfer link as private.'
            ], [
                'Vous envoyer vos données enregistrées',
                'Sur l’appareil d’origine, choisissez l’envoi des données par courriel. Vérifiez le brouillon ouvert dans votre messagerie, puis envoyez-le à votre adresse. L’application ne l’envoie pas automatiquement. Gardez le lien de transfert confidentiel.'
            ]),
            step('settings', '#transfer-link-input', [
                'Preview before replacing saved data',
                'On the other device, paste the complete link into Settings in the app you want to update, then select Preview saved data. Nothing changes until you confirm Replace saved data. This replaces, not merges, the receiving device’s saved data.'
            ], [
                'Prévisualiser avant de remplacer les données',
                'Sur l’autre appareil, collez le lien complet dans les paramètres de l’application à mettre à jour, puis prévisualisez les données. Rien ne change avant de confirmer leur remplacement. Les données de l’appareil récepteur sont remplacées, et non fusionnées.'
            ]),
            step('settings', '.menu-hard-reset', [
                'Reset only when you mean to clear saved data',
                'Reset saved data clears local app data after you confirm. Unlike restarting the flowchart, it also removes saved sessions and bookmarks. Make a backup first if you need to keep them.'
            ], [
                'Réinitialiser seulement pour effacer les données',
                'La réinitialisation efface les données locales après confirmation. Contrairement au redémarrage du parcours, elle supprime aussi les séances et les favoris. Faites une sauvegarde si vous voulez les conserver.'
            ]),
            step('home', '#install-app-btn, #install-banner-install', [
                'Install the app when your browser offers it',
                'Use Install App in the header or phone menu when available. Follow the browser prompt or the on-screen instructions. You can keep using the app in your browser without installing it.'
            ], [
                'Installer l’application si le navigateur le permet',
                'Utilisez le bouton d’installation dans l’en-tête ou le menu du téléphone lorsqu’il est offert. Suivez les instructions du navigateur ou de l’application. L’installation n’est pas obligatoire.'
            ], { example: ['Install App', 'Installer l’application'] })
        ]]
    ];

    const byId = id => document.getElementById(id);
    const dialog = byId('app-tutorial');
    const choices = byId('tutorial-choices');
    const panel = dialog.querySelector('.tutorial-panel');
    const spotlight = dialog.querySelector('.tutorial-spotlight');
    const example = dialog.querySelector('.tutorial-example');
    const heading = byId('tutorial-heading');
    const progress = byId('tutorial-progress');
    const reference = byId('tutorial-reference');
    const back = byId('tutorial-back');
    const next = byId('tutorial-next');
    const fullTour = sections.flatMap(([section, steps]) => steps.map(item => ({ ...item, section })));
    let activeTour;
    let index;
    let origin;
    let target;
    let frame;
    let showFaq;

    function renderChoices() {
        choices.replaceChildren();
        const addChoice = (key, steps, primary = false) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = t(key);
            button.setAttribute('aria-haspopup', 'dialog');
            button.setAttribute('aria-controls', dialog.id);
            button.classList.toggle('tutorial-primary', primary);
            button.addEventListener('click', event => {
                event.stopPropagation();
                start(steps, button);
            });
            choices.append(button);
        };
        addChoice('tutorial_full', fullTour, true);
        sections.forEach(([key]) => addChoice(key, fullTour.filter(item => item.section === key)));
    }

    function start(steps, launcher) {
        const toolkitToggle = byId('toolkit-view-toggle');
        origin = {
            launcher, x: window.scrollX, y: window.scrollY,
            toolkitTable: toolkitToggle.getAttribute('aria-checked') === 'true',
            toolkitView: menuUiState.view, editingField: menuUiState.editingField
        };
        activeTour = steps;
        index = 0;
        showFaq = false;
        dialog.showModal();
        renderStep();
    }

    function visit(page) {
        if (page === 'flowchart' && (!pathwayContext || !byId('flowchart-container').dataset.initialized)) page = 'home';
        const inCentre = RESOURCE_CENTRE_PAGES.includes(page);
        if (inCentre && appState.currentPage === 'resource-centre') {
            if (resourceCentrePage !== page) selectResourceCentrePage(page);
        } else if (appState.currentPage !== page) {
            navigateToPage(page, { tutorial: true, sessionNotesOnly: page === 'flowchart' });
        }
    }

    function visibleTarget(selector) {
        for (const alternative of selector.split(', ')) {
            const match = [...document.querySelectorAll(alternative)].find(el =>
                el.getClientRects().length && getComputedStyle(el).visibility === 'visible'
                && el.getBoundingClientRect().width && el.getBoundingClientRect().height);
            if (match) return match;
        }
        return null;
    }

    function renderStep() {
        const item = activeTour[index];
        const french = document.documentElement.lang === 'fr';
        const [title, description] = french ? item.fr : item.en;
        visit(item.page);
        if (item.page === 'interventions') {
            origin.visitedToolkit = true;
            setToolkitView(item.table ? 'table' : 'guided');
            if (!item.table) {
                menuUiState.view = item.results ? 'results' : 'search';
                applyMenuViewState();
                if (menuUiState.view === 'results') renderMenuResults();
            }
        }
        progress.textContent = t('tutorial_progress')(t(item.section), index + 1, activeTour.length);
        progress.hidden = false;
        heading.textContent = title;
        byId('tutorial-description').textContent = description;
        reference.hidden = !item.dibels;
        reference.open = false;
        byId('tutorial-reference-text').textContent = t('tutorial_dibels_text');
        byId('tutorial-controls').hidden = false;
        back.disabled = index === 0;
        next.textContent = t(index + 1 === activeTour.length ? 'tutorial_done' : 'tutorial_next');
        heading.focus({ preventScroll: true });
        panel.scrollTop = 0;
        chooseTarget(true);
    }

    function chooseTarget(scroll) {
        if (!dialog.open) return;
        const item = activeTour[index];
        target = visibleTarget(item.selector);
        example.hidden = !!target || !item.example;
        if (!example.hidden) {
            byId('tutorial-example-label').textContent = t('tutorial_example');
            target = byId('tutorial-example-control');
            target.textContent = item.example[document.documentElement.lang === 'fr' ? 1 : 0];
        } else if (target && scroll) {
            target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
        }
        schedulePlacement();
    }

    function schedulePlacement() {
        if (!dialog.open) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(placeSpotlight);
    }

    function placeSpotlight() {
        const width = dialog.clientWidth;
        const height = dialog.clientHeight;
        const rect = target?.getBoundingClientRect();
        const left = rect && Math.max(0, rect.left - 5);
        const top = rect && Math.max(0, rect.top - 5);
        const right = rect && Math.min(width, rect.right + 5);
        const bottom = rect && Math.min(height, rect.bottom + 5);
        const fits = rect && right > left && bottom > top;
        spotlight.hidden = !fits;
        dialog.classList.toggle('tutorial-has-target', !!fits);
        if (fits) {
            Object.assign(spotlight.style, {
                left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px`
            });
        }
        panel.classList.toggle('tutorial-place-top', !!fits && height - bottom < top);
        if (fits) {
            const available = Math.max(top, height - bottom);
            panel.style.maxHeight = `min(calc(100% - 24px), ${Math.max(124, available - 22)}px)`;
        } else {
            panel.style.removeProperty('max-height');
        }
    }

    function close() {
        dialog.close();
        cancelAnimationFrame(frame);
        if (origin.visitedToolkit) {
            menuUiState.view = origin.toolkitView;
            applyMenuViewState();
            menuUiState.editingField = origin.editingField;
            if (menuUiState.view === 'results') renderMenuResults();
            setToolkitView(origin.toolkitTable ? 'table' : 'guided');
        }
        visit(showFaq ? 'faq' : 'tutorials');
        if (showFaq) {
            const question = byId('tutorial-dibels-reference').closest('button');
            const item = faqState.items.find(entry => entry.el === question.closest('.faq-item'));
            clearFaqFilters();
            setFaqCategory(item.categoryIndex, false);
            if (question.getAttribute('aria-expanded') !== 'true') toggleFAQ(question);
            question.scrollIntoView({ block: 'center', behavior: 'instant' });
            question.focus({ preventScroll: true });
        } else {
            window.scrollTo({ left: origin.x, top: origin.y, behavior: 'instant' });
            origin.launcher.focus({ preventScroll: true });
        }
        target = null;
    }

    next.addEventListener('click', () => {
        if (index + 1 === activeTour.length) close();
        else { index += 1; renderStep(); }
    });
    back.addEventListener('click', () => {
        if (index > 0) { index -= 1; renderStep(); }
    });
    byId('tutorial-menu').addEventListener('click', close);
    dialog.querySelector('.tutorial-close').addEventListener('click', close);
    dialog.addEventListener('click', event => event.stopPropagation());
    byId('tutorial-open-faq').addEventListener('click', () => { showFaq = true; close(); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    // Keep global app shortcuts from handling Escape beneath the active tour.
    window.addEventListener('keydown', event => {
        if (dialog.open && event.key === 'Escape') {
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
        }
    }, true);
    window.addEventListener('scroll', schedulePlacement, true);
    window.addEventListener('resize', () => chooseTarget(true));
    reference.addEventListener('toggle', schedulePlacement);
    new MutationObserver(renderChoices).observe(document.documentElement, {
        attributes: true, attributeFilter: ['lang']
    });
    renderChoices();
})();
