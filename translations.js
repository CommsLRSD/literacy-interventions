// ============================================
// Literacy Interventions — Translations (English / French)
// ============================================
// Assessment Names, Screener Names, and Intervention Names are intentionally
// NOT translated — they are rendered directly from the JSON data files.

const TRANSLATIONS = {
    en: {
        // ── Page title ──
        page_title: 'Literacy Interventions — LRSD Literacy Resource',

        // ── Skip link ──
        skip_to_content: 'Skip to content',

        // ── Nav ──
        nav_home: 'Home',
        nav_flowchart: 'Flowchart',
        nav_interventions: 'Teaching Resources',
        nav_scores: 'Understanding Scores & Percentiles',
        nav_resources: 'Resources',
        nav_faq: 'FAQs',
        nav_about: 'About',
        nav_interventions_mobile: 'Teaching Resources',
        nav_schedule: 'Assessment Schedule',
        nav_history: 'History',
        nav_lang_toggle_label: 'Switch to French',
        nav_lang_code: 'FR',
        program_prompt_badge: 'Let’s get started',
        program_prompt_title: 'Choose your program',
        program_prompt_desc: 'Select the program you are working in to open the right version of the app.',
        program_prompt_english_desc: 'Jump right into the English app.',
        program_prompt_french_desc: 'Choose English or French on the next step.',
        program_prompt_language_title: 'Choose your language',
        program_prompt_language_desc: 'How would you like to use the French Immersion app today?',
        program_prompt_language_label: 'Which language would you like to use?',
        program_prompt_language_en_desc: 'Open the app in English.',
        program_prompt_language_fr_desc: 'Open the app in French.',
        program_prompt_back: 'Back',

        // ── PWA install (button, banner, instructions modal) ──
        install_btn: 'Install App',
        install_btn_label: 'Install app',
        install_banner_region: 'Install Literacy Interventions',
        install_banner_title: 'Install Literacy Interventions',
        install_banner_desc: 'Add Literacy Interventions to your device for quick, full-screen access.',
        install_banner_install: 'Install',
        install_banner_dismiss: 'Not now',
        install_banner_dismiss_label: 'Dismiss install suggestion',
        install_modal_title: 'Install Literacy Interventions',
        install_modal_close_label: 'Close',
        install_modal_desc: 'Your browser does not offer a one-tap install. Follow these steps to add Literacy Interventions to your home screen:',
        install_modal_step1: 'Tap the Share button.',
        install_modal_step2: 'Select \u201cAdd to Home Screen.\u201d',
        install_modal_step3: 'Tap \u201cAdd.\u201d',
        install_modal_done: 'Got it',

        // ── Home hero ──
        hero_eyebrow: 'LRSD Literacy Resource',
        hero_title_html: 'Building <span class="accent-word">Lifelong</span><br>Literacy Together',
        hero_subtitle: 'Supporting educators in identifying and implementing effective literacy interventions for every learner.',

        // ── Home CTA cards ──
        cta_flowchart_title: 'Intervention Flowchart',
        cta_flowchart_desc: 'Step-by-step decision guide to navigate tiers of support based on student screening results.',
        cta_flowchart_btn: 'Start Flowchart',
        cta_interventions_title: 'Teaching Resources',
        cta_interventions_desc: 'Browse teaching resources by screener, subtest, and literacy pillar.',
        cta_interventions_btn: 'Browse Resources',
        cta_schedule_title: 'Assessment Schedule',
        cta_schedule_desc: 'See when universal screening and progress monitoring happen across the school year.',
        cta_schedule_btn: 'View Schedule',
        cta_scores_title: 'Understanding Scores & Percentiles',
        cta_scores_desc: 'Learn how standard scores, percentile ranks, and DIBELS risk categories are used to understand student performance.',
        cta_scores_btn: 'Learn More',
        cta_resources_title: 'Resources',
        cta_resources_desc: 'Scope and sequence documents, learning progressions, and the division literacy screening summary.',
        cta_resources_btn: 'Browse Resources',
        cta_about_title: 'About This Guide',
        cta_about_desc: 'Learn about the purpose of this guide, the screening schedule, and the RTI/MTSS framework behind it.',
        cta_about_btn: 'Learn More',

        // ── Home explore-more section ──
        explore_eyebrow: 'Go deeper',
        explore_title: 'Reference & Resources',
        explore_subtitle: 'Background reading and division documents to support your literacy work.',

        // ── Flowchart section ──
        flowchart_section_title: 'Intervention Flowchart',
        flowchart_section_subtitle: 'Step-by-step decision guide to navigate tiers of support based on student screening results',

        // ── Interventions section ──
        interventions_section_title: 'Teaching Resources',
        interventions_section_subtitle: 'Quickly filter teaching resources by literacy focus and learner needs',
        wizard_choose_steps: 'Filter to find resources',
        wizard_select_placeholder: 'All',
        wizard_all_pillars: 'All Pillars',
        wizard_start_over: 'Clear Filters',
        wizard_evidence_info_label: 'Show evidence and research based definitions',
        wizard_evidence_info_text: 'Evidence and research based definitions',
        filter_program_label: 'Program',
        filter_language_label: 'Language Program',
        filter_language_french: 'French Immersion',
        filter_advanced_label: 'Advanced filters',
        filter_tier_label: 'Tier',
        filter_grade_label: 'Grade Level',
        filter_active_none: 'No filters applied — showing all resources.',
        filter_remove_filter: 'Remove this filter',
        filter_pillar_label: 'Literacy Pillar',
        filter_type_label: 'Resource Type',
        filter_screener_label: 'Screener',
        filter_subtest_label: 'Subtest',
        filter_evidence_label: 'Evidence Classification',
        filter_evidence_eb: '* Evidence Based',
        filter_evidence_rb: '** Research Based',
        filter_search_label: 'Search',
        filter_search_placeholder: 'Search by resource name…',
        filter_tier_option: (n) => `Tier ${n}`,
        filter_results_label: (n) => `${n} resource${n !== 1 ? 's' : ''}`,
        filter_results_none: 'No resources match the selected filters. Try clearing a filter.',
        filter_view_resource: 'View Resource',
        filter_no_link: 'No link available',
        filter_grades_label: 'Grades',
        filter_notes_label: 'Notes',
        filter_screeners_label: 'Screeners',
        fw_choose_pillar_label: 'Literacy Pillar',
        fw_choose_screener_label: 'Screener',
        fw_context_tier: (n) => `Tier ${n}`,

        // ── Assessment schedule section ──
        schedule_section_title: 'Assessment Schedule',
        schedule_section_subtitle: 'Universal screening and progress monitoring timeline for the English and French Immersion programs',
        schedule_intervention_period: 'Intervention Period',
        schedule_intervention_note: 'Interventions run between assessment windows and pause while assessments are underway.',
        schedule_report_cards: 'Report Cards',
        schedule_school_year: 'School Year',
        schedule_filter_label: 'Filter by program',
        schedule_grade_filter_label: 'Filter by Grade',
        schedule_grade_all: 'All grades',
        schedule_grade_column: 'Grade',
        schedule_program_english: 'English Program',
        schedule_program_french: 'French Immersion Program',
        schedule_program_english_short: 'EN',
        schedule_program_french_short: 'FR',
        schedule_legend_midmonth: 'Dotted line marks the middle of each month',
        schedule_legend_assessment_types: 'Assessment Types',
        schedule_legend_notes: 'Notes',
        schedule_month_before: 'Before',
        schedule_month_sep: 'Sep',
        schedule_month_oct: 'Oct',
        schedule_month_nov: 'Nov',
        schedule_month_dec: 'Dec',
        schedule_month_jan: 'Jan',
        schedule_month_feb: 'Feb',
        schedule_month_mar: 'Mar',
        schedule_month_apr: 'Apr',
        schedule_month_may: 'May',
        schedule_month_jun: 'Jun',

        // ── Scores section ──
        scores_section_title: 'Understanding Scores & Percentiles',
        scores_section_subtitle: 'A reference guide to interpreting student screening results',
        scores_avg_percentile_title: 'Average Percentile Range',
        scores_avg_percentile_value: '16th to 84th percentile',
        scores_avg_standard_title: 'Average Standard Score Range',
        scores_avg_standard_value: '85 to 115 standard score',
        scores_acc_percentile_title: 'What percentile ranks mean',
        scores_acc_percentile_p1: 'Percentile ranks compare a student to same-age peers. A percentile of 16 means the student scored as well as or better than 16% of peers; a percentile of 75 means as well as or better than 75% of peers.',
        scores_acc_percentile_p2: 'Percentiles are not the same as percent correct. They show relative standing, not the number of test items answered correctly.',
        scores_acc_standard_title: 'What standard scores mean',
        scores_acc_standard_p1: 'Standard scores make it easier to compare results across measures. Most tests use 100 as the average score and 15-point intervals to describe score ranges.',
        scores_acc_standard_p2: 'A standard score from 85 to 115 is typically considered average.',
        scores_acc_dibels_title: 'DIBELS risk categories',
        scores_acc_dibels_intro: 'DIBELS categories indicate the likelihood of meeting end-of-year grade-level reading goals.',
        scores_dibels_blue: 'Blue — Above Benchmark',
        scores_dibels_blue_desc: 'Core support; negligible risk.',
        scores_dibels_green: 'Green — At Benchmark',
        scores_dibels_green_desc: 'Core support; minimal risk.',
        scores_dibels_yellow: 'Yellow — Some Risk',
        scores_dibels_yellow_desc: 'Strategic small-group support and progress monitoring.',
        scores_dibels_red: 'Red — At Risk',
        scores_dibels_red_desc: 'Intensive support with close progress monitoring.',


        // ── Resources section ──
        resources_section_title: 'Resources',
        resources_section_subtitle: 'Division documents supporting structured literacy instruction, screening, and progress monitoring',
        resources_note: 'Documents open in a new tab. Some links are hosted on the LRSD staff SharePoint and require a division sign-in.',
        resources_group_division: 'Division overview',
        resources_group_english: 'English program',
        resources_group_french: 'Français et immersion française',
        resources_link_screening: 'Literacy Screening and Progress Monitoring in Louis Riel School Division',
        resources_link_en_k2: 'English Program: K–2 Scope & Sequence for Structured Literacy',
        resources_link_en_36: 'English Program: Grades 3–6 Scope & Sequence for Structured Literacy',
        resources_link_fr_m3: 'Progression des apprentissages M-3 année',
        resources_link_fr_46: 'Progression des apprentissages 4-6 année',
        resources_link_fi_24: 'French Immersion: Grades 2-4 Scope and Sequence for Structured Literacy',
        resources_link_fi_56: 'French Immersion: Grades 5-6 Scope and Sequence for Structured Literacy',

        // ── FAQ section ──
        faq_section_title: 'FAQs',
        faq_section_subtitle: 'Answers to common questions about CTOPP-2, DIBELS, THaFol, and the LRSD literacy data portal',

        // ── About section ──
        about_section_title: 'About',
        about_section_subtitle: 'Welcome to Literacy Interventions, an interactive teaching guide by the Louis Riel School Division.',
        about_heading_purpose: 'Purpose of This Document',
        about_purpose_p1: 'This document is designed to support teachers, clinicians, principals, and vice-principals in interpreting data while collaboratively and effectively planning for instruction and intervention.',
        about_purpose_p2: 'It includes a schedule detailing the universal screening and progress monitoring required at each grade level for both English and French Immersion programs. Additionally, it features interactive content to help interpret data and determine next steps.',
        about_heading_frequency: 'Frequency of Screening and Progress Monitoring',
        about_frequency_p1: 'In 2023, the Ontario Human Rights Commission\'s Two-Year Update Right to Read report recommended conducting at least two screenings per year in K-2. The Saskatchewan Human Rights Commission suggested two to three times annually. The creators of DIBELS at the University of Oregon recommend progress monitoring three times per year. Reviewing the HRC reports, various research studies, and consultations with researchers in the field informed the Screening and Progress Monitoring Schedule adopted by LRSD and included in this document. The schedule applies to all students in LRSD in K-8. This schedule will be reviewed annually to ensure the timing and frequency of assessments continue to support student learning and educator needs while also being aligned with best practices as outlined in the research.',
        about_heading_access: 'Access to Data and Its Importance',
        about_access_p1: 'Specific reports have been developed for teachers to access student screening and progress monitoring data in Power BI. These reports are available in the PowerBI teacher workspace. School leaders and student services teachers also have access to school- and system-level reports through their respective Power BI workspaces. Using this evidence-based data to inform instructional planning is essential, which is why the screening process is so important.',
        about_heading_rti: 'Planning for Intervention: RTI and MTSS',
        about_rti_p1: 'This document provides a step-by-step tool that allows teachers to input observations and data results, leading to recommendations for next steps. LRSD strongly advocates for the application of the principles of Response to Intervention (RTI) and Multi-Tiered System of Supports (MTSS) to guide all intervention planning, ensuring all students, including those with reading difficulties or learning disabilities, receive high-quality instruction and targeted support.',
        about_rti_p2: 'RTI is a proactive, data-driven framework that helps teachers make informed decisions and adjust instruction to improve student learning. It follows a three-tier model:',
        about_rti_tier1: '<strong>Tier 1:</strong> Research-supported teaching practices in regular classrooms.',
        about_rti_tier2: '<strong>Tier 2:</strong> Targeted support for students needing additional assistance.',
        about_rti_tier3: '<strong>Tier 3:</strong> Intensive, individualized interventions for students who continue to struggle.',
        about_rti_p3: 'MTSS builds on RTI by incorporating a tiered approach that addresses not only academic needs but also social, emotional, and behavioral development. Within MTSS, reading interventions are categorized based on their place in the framework, focusing on foundational skills for struggling readers and using progress monitoring assessments to guide intervention planning.',
        about_rti_p4: 'All interventions should be evidence-based or aligned with effective classroom instruction methods to maximize student success.',
        about_heading_living: 'A Living Document',
        about_living_p1: 'This resource is a living document that will be updated periodically. Please continue using the provided link to ensure you are accessing the latest version. There is also a link provided to collect feedback. Please use the link to share your feedback to support the improvement of this document over time.',
        about_heading_dev: 'Development and Acknowledgements',
        about_dev_p1: 'This document is the result of a collaborative effort to make the vast resources available on the Teaching and Learning Portal more practical and accessible for educators. It is intended to reflect best practices based on widely accepted research, extensive consultations, and numerous discussions with researchers, practitioners, and specialists in the field of evidence-based literacy instruction and intervention.',
        about_dev_p2: 'LRSD would like to acknowledge Rob George, Karla Gutierrez, Nicholas Kelly, Kristen McDowell, Geneviève Shyiak, Lisa Tymchuk, and Dr. Caroline Erdos for their contributions to this resource. Additionally, we must recognize Cody Sellar for his vision and creativity in bringing this project to life in its electronic and interactive format.',
        about_feedback_text: 'We want to hear from you! Let us know what you think of this project.',
        about_feedback_btn: 'Provide your feedback',

        // ── Footer ──
        footer_text: '© 2025–2026 Literacy Interventions · Louis Riel School Division · Supporting educators in literacy intervention',

        // ── Selection history / tracker ──
        history_label: 'History',
        history_panel_label: 'Selection History',
        history_panel_intro: 'A running record of every drill-down assessment and intervention you select in the flowchart, grouped by session with the date you chose each item.',
        history_panel_warning: 'This history is saved only in this browser. Clearing your browser cache or site data will permanently erase it. Export to CSV to keep a copy.',
        history_export_csv: 'Export CSV',
        history_clear_all: 'Clear All',

        // ── Flowchart UI (dynamic) ──
        fc_back: 'Restart',
        fc_your_decisions: 'Your Decisions',
        fc_summary_view: 'Summary View',
        fc_standard_view: 'Standard View',
        fc_switch_summary: 'Switch to summary view',
        fc_switch_standard: 'Switch to standard view',
        fc_view_switcher: 'Switch decision view',
        fc_back_one_step: 'Back one step',
        fc_screener_label: 'Screener:',
        fc_tier_label: 'Tier',
        fc_step_label: 'Step',
        fc_step_of: 'of',
        fc_in_progress: 'In progress',
        fc_coming_up: 'Coming up next',
        fc_revisit: 'Revisit',
        fc_visual_view: 'Visual pathway',
        fc_visual_open: 'Open visual pathway view',
        fc_visual_eyebrow: 'Desktop flowchart view',
        fc_visual_title: 'Build Your Pathway',
        fc_visual_desc: 'Complete each step to reveal where your pathway leads. Drag to move around the canvas.',
        fc_visual_close: 'Close visual pathway',
        fc_visual_zoom_controls: 'Pathway legend and zoom controls',
        fc_visual_effective: 'Effective',
        fc_visual_ineffective: 'Ineffective',
        fc_visual_zoom_out: 'Zoom out',
        fc_visual_zoom_in: 'Zoom in',
        fc_visual_fit: 'Fit pathway to screen',
        fc_visual_canvas: 'Pathway canvas. Use arrow keys to move around.',
        fc_visual_fullscreen: 'Enter full screen',
        fc_visual_fullscreen_exit: 'Exit full screen',
        fc_visual_tier_collapsed: (n, count) => `Tier ${n} · ${count} step${count !== 1 ? 's' : ''} · Tap to expand`,
        fc_visual_tier_collapse: 'Collapse this tier',
        fc_visual_tier_review_label: 'Review before continuing',

        // ── Flowchart program / language mini selector (shown beside the flowchart) ──
        fc_program_mini_label: 'Program',
        fc_language_mini_label: 'Language',
        fc_program_english: 'English',
        fc_program_french_immersion: 'French Immersion',
        fc_language_english: 'English',
        fc_language_french: 'French',
        fc_program_change_confirm: 'Switching the program will reset the flowchart to the beginning and erase your current progress. Continue?',

        // ── Step type labels ──
        step_type_check: 'Check',
        step_type_choose: 'Choose',
        step_type_decide: 'Decide',
        step_type_read: 'Read',
        step_type_outcome: 'Outcome',
        step_type_step: 'Step',
        step_type_reviewed: 'Reviewed',

        // ── Tier transition ──
        go_to_tier: 'Go to Tier',
        go_to_tier_note: 'You are moving on to the next tier of support.',
        continue_to_tier: 'Continue to Tier',
        moving_to_tier: 'Moving to Tier',
        tier1_sidebar_heading: 'How do we determine if instruction is Effective or Ineffective?',
        tier1_blue_green_label: 'Blue and Green Indicators',
        tier1_blue_green_desc: 'If student screener results indicate Blue or Green in all areas, instruction is effective.',
        tier1_yellow_red_label: 'Yellow and Red Indicators',
        tier1_yellow_red_desc: 'If student screener results indicate Yellow or Red in any one area, instruction is ineffective.',
        tier1_monitoring_note: 'Monitoring and interventions are needed.',
        tier1_see_scores: 'See Understanding Scores & Percentiles',

        // ── Route complete gate ──
        gate_title: 'Route Complete',
        gate_subtitle_steps: (n) => `You completed ${n} step${n !== 1 ? 's' : ''} across`,
        gate_desc: 'Click below to see a visual summary of your complete intervention pathway.',
        gate_view_summary: 'View Journey Summary',
        anim_skip: 'Skip animation',

        // ── Recommendations ──
        recommendations_title: 'Recommendations',
        go_back: 'Go Back',

        // ── Tier labels (tabs and name bar) ──
        tier1_label: 'Tier 1',
        tier2_label: 'Tier 2',
        tier3_label: 'Tier 3',
        tier_toggle_group_label: 'Tier',

        // ── Check all ──
        check_all: 'Check All',
        uncheck_all: 'Uncheck All',
        all_reviewed: (n) => `All ${n} principles reviewed ✓`,

        // ── Journey map count ──
        journey_step_count: (n) => `Step ${n}`,
        journey_step_of: (n, total) => `Step ${n} of ${total}`,
        journey_complete: 'Complete',

        // ── Final summary ──
        final_summary_close: 'Close summary',
        tier_complete: 'Tier complete',

        // ── Evidence popup ──
        evidence_eb_title: '* Evidence Based: Most rigorous and trusted',
        evidence_eb_desc: 'Definition: The program or practice has been tested through high-quality peer reviewed research (often randomized controlled trials or quasi-experimental studies) and has demonstrated statistically significant positive outcomes.',
        evidence_rb_title: '** Research Based: Less rigorous than evidence-based',
        evidence_rb_desc: 'Definition: The program is based on sound theories or methods that have been validated by some research, but the program itself may not have been directly studied for evidence of its effectiveness.',
        evidence_legend_label: '* Evidence Based / ** Research Based',
        evidence_legend_aria: 'Evidence and research based definitions',

        // ── FW results ──
        fw_no_results: 'No matching items found for the selected criteria.',
        fw_results_label: (n) => `${n} result${n !== 1 ? 's' : ''}`,
        fw_time_prefix: 'Time:',
        fw_grade_prefix: 'Gr.',
    },

    fr: {
        // ── Page title ──
        page_title: 'Literacy Interventions — Ressource en littératie de la DSLR',

        // ── Skip link ──
        skip_to_content: 'Passer au contenu',

        // ── Nav ──
        nav_home: 'Accueil',
        nav_flowchart: 'Organigramme',
        nav_interventions: 'Ressources pédagogiques',
        nav_scores: 'Comprendre les scores et les percentiles',
        nav_resources: 'Ressources',
        nav_faq: 'FAQ',
        nav_about: 'À propos',
        nav_interventions_mobile: 'Ressources pédagogiques',
        nav_schedule: 'Calendrier d\'évaluation',
        nav_history: 'Historique',
        nav_lang_toggle_label: 'Passer à l\'anglais',
        nav_lang_code: 'EN',
        program_prompt_badge: 'Commençons',
        program_prompt_title: 'Choisissez votre programme',
        program_prompt_desc: 'Sélectionnez le programme dans lequel vous travaillez pour ouvrir la bonne version de l’application.',
        program_prompt_english_desc: 'Accédez directement à l’application en anglais.',
        program_prompt_french_desc: 'Choisissez ensuite l’anglais ou le français.',
        program_prompt_language_title: 'Choisissez votre langue',
        program_prompt_language_desc: 'Comment souhaitez-vous utiliser l’application d’immersion française aujourd’hui?',
        program_prompt_language_label: 'Quelle langue souhaitez-vous utiliser?',
        program_prompt_language_en_desc: 'Ouvrir l’application en anglais.',
        program_prompt_language_fr_desc: 'Ouvrir l’application en français.',
        program_prompt_back: 'Retour',

        // ── PWA install (button, banner, instructions modal) ──
        install_btn: 'Installer l\'application',
        install_btn_label: 'Installer l\'application',
        install_banner_region: 'Installer Literacy Interventions',
        install_banner_title: 'Installer Literacy Interventions',
        install_banner_desc: 'Ajoutez Literacy Interventions à votre appareil pour un accès rapide en plein écran.',
        install_banner_install: 'Installer',
        install_banner_dismiss: 'Plus tard',
        install_banner_dismiss_label: 'Masquer la suggestion d\'installation',
        install_modal_title: 'Installer Literacy Interventions',
        install_modal_close_label: 'Fermer',
        install_modal_desc: 'Votre navigateur n\'offre pas d\'installation en un seul geste. Suivez ces étapes pour ajouter Literacy Interventions à votre écran d\'accueil :',
        install_modal_step1: 'Touchez le bouton Partager.',
        install_modal_step2: 'Sélectionnez \u00ab\u00a0Sur l\'écran d\'accueil\u00a0\u00bb.',
        install_modal_step3: 'Touchez \u00ab\u00a0Ajouter\u00a0\u00bb.',
        install_modal_done: 'Compris',

        // ── Home hero ──
        hero_eyebrow: 'Ressource en littératie de la DSLR',
        hero_title_html: 'Bâtir ensemble une <span class="accent-word">littératie</span><br>pour la vie',
        hero_subtitle: 'Soutenir les enseignants dans l\'identification et la mise en œuvre d\'interventions efficaces en littératie pour chaque apprenant.',

        // ── Home CTA cards ──
        cta_flowchart_title: 'Organigramme d\'intervention',
        cta_flowchart_desc: 'Guide de décision étape par étape pour naviguer dans les paliers de soutien en fonction des résultats de dépistage des élèves.',
        cta_flowchart_btn: 'Démarrer l\'organigramme',
        cta_interventions_title: 'Ressources pédagogiques',
        cta_interventions_desc: 'Parcourir les ressources pédagogiques par outil de dépistage, sous-test et pilier de la littératie.',
        cta_interventions_btn: 'Parcourir les ressources',
        cta_schedule_title: 'Calendrier d\'évaluation',
        cta_schedule_desc: 'Voir à quel moment le dépistage universel et le suivi des progrès ont lieu au cours de l\'année scolaire.',
        cta_schedule_btn: 'Voir le calendrier',
        cta_scores_title: 'Comprendre les scores et les percentiles',
        cta_scores_desc: 'Découvrir comment les scores standards, les rangs percentiles et les catégories de risque DIBELS sont utilisés pour comprendre les résultats des élèves.',
        cta_scores_btn: 'En savoir plus',
        cta_resources_title: 'Ressources',
        cta_resources_desc: 'Documents de portée et de séquence, progressions des apprentissages et sommaire du dépistage en littératie de la division.',
        cta_resources_btn: 'Parcourir les ressources',
        cta_about_title: 'À propos de ce guide',
        cta_about_desc: 'Découvrez l\'objectif de ce guide, l\'horaire de dépistage et le cadre RTI/MTSS qui le sous-tend.',
        cta_about_btn: 'En savoir plus',

        // ── Home explore-more section ──
        explore_eyebrow: 'Pour aller plus loin',
        explore_title: 'Références et ressources',
        explore_subtitle: 'Lectures complémentaires et documents de la division pour soutenir votre travail en littératie.',

        // ── Flowchart section ──
        flowchart_section_title: 'Organigramme d\'intervention',
        flowchart_section_subtitle: 'Guide de décision étape par étape pour naviguer dans les paliers de soutien en fonction des résultats de dépistage',

        // ── Interventions section ──
        interventions_section_title: 'Ressources pédagogiques',
        interventions_section_subtitle: 'Filtrez rapidement les ressources par domaine de littératie et besoins des élèves',
        wizard_choose_steps: 'Filtrer pour trouver des ressources',
        wizard_select_placeholder: 'Tous',
        wizard_all_pillars: 'Tous les piliers',
        wizard_start_over: 'Effacer les filtres',
        wizard_evidence_info_label: 'Afficher les définitions fondées sur des données probantes et la recherche',
        wizard_evidence_info_text: 'Définitions fondées sur des données probantes et la recherche',
        filter_program_label: 'Programme',
        filter_language_label: 'Programme linguistique',
        filter_language_french: 'Immersion française',
        filter_advanced_label: 'Filtres avancés',
        filter_tier_label: 'Niveau (Tier)',
        filter_grade_label: 'Année scolaire',
        filter_active_none: 'Aucun filtre appliqué — toutes les ressources sont affichées.',
        filter_remove_filter: 'Retirer ce filtre',
        filter_pillar_label: 'Pilier de littératie',
        filter_type_label: 'Type de ressource',
        filter_screener_label: 'Outil de dépistage',
        filter_subtest_label: 'Sous-test',
        filter_evidence_label: 'Classification des données probantes',
        filter_evidence_eb: '* Fondé sur des données probantes',
        filter_evidence_rb: '** Fondé sur la recherche',
        filter_search_label: 'Rechercher',
        filter_search_placeholder: 'Rechercher par nom de ressource…',
        filter_tier_option: (n) => `Niveau ${n}`,
        filter_results_label: (n) => `${n} ressource${n !== 1 ? 's' : ''}`,
        filter_results_none: 'Aucune ressource ne correspond aux filtres sélectionnés. Essayez d\'en retirer un.',
        filter_view_resource: 'Voir la ressource',
        filter_no_link: 'Aucun lien disponible',
        filter_grades_label: 'Années',
        filter_notes_label: 'Remarques',
        filter_screeners_label: 'Outils de dépistage',
        fw_choose_pillar_label: 'Pilier de littératie',
        fw_choose_screener_label: 'Outil de dépistage',
        fw_context_tier: (n) => `Niveau ${n}`,

        // ── Assessment schedule section ──
        schedule_section_title: 'Calendrier d\'évaluation',
        schedule_section_subtitle: 'Calendrier de dépistage universel et de suivi des progrès pour les programmes anglais et d\'immersion française',
        schedule_intervention_period: 'Période d\'intervention',
        schedule_intervention_note: 'Les interventions se déroulent entre les périodes d\'évaluation et s\'interrompent pendant celles-ci.',
        schedule_report_cards: 'Bulletins',
        schedule_school_year: 'Année scolaire',
        schedule_filter_label: 'Filtrer par programme',
        schedule_grade_filter_label: 'Filtrer par niveau',
        schedule_grade_all: 'Tous les niveaux',
        schedule_grade_column: 'Niveau',
        schedule_program_english: 'Programme anglais',
        schedule_program_french: 'Programme d\'immersion française',
        schedule_program_english_short: 'EN',
        schedule_program_french_short: 'FR',
        schedule_legend_midmonth: 'La ligne pointillée marque le milieu de chaque mois',
        schedule_legend_assessment_types: 'Types d\'évaluation',
        schedule_legend_notes: 'Remarques',
        schedule_month_before: 'Avant',
        schedule_month_sep: 'Sept',
        schedule_month_oct: 'Oct',
        schedule_month_nov: 'Nov',
        schedule_month_dec: 'Déc',
        schedule_month_jan: 'Janv',
        schedule_month_feb: 'Févr',
        schedule_month_mar: 'Mars',
        schedule_month_apr: 'Avr',
        schedule_month_may: 'Mai',
        schedule_month_jun: 'Juin',

        // ── Scores section ──
        scores_section_title: 'Comprendre les scores et les percentiles',
        scores_section_subtitle: 'Un guide de référence pour interpréter les résultats de dépistage des élèves',
        scores_avg_percentile_title: 'Plage de percentiles moyenne',
        scores_avg_percentile_value: '16e au 84e percentile',
        scores_avg_standard_title: 'Plage de scores standards moyenne',
        scores_avg_standard_value: 'Score standard de 85 à 115',
        scores_acc_percentile_title: 'Ce que signifient les rangs percentiles',
        scores_acc_percentile_p1: 'Les rangs percentiles comparent un élève à des pairs du même âge. Un percentile de 16 signifie que l\'élève a obtenu un résultat aussi bon ou meilleur que 16 % de ses pairs; un percentile de 75 signifie aussi bon ou meilleur que 75 % de ses pairs.',
        scores_acc_percentile_p2: 'Les percentiles ne correspondent pas aux pourcentages de bonnes réponses. Ils indiquent le classement relatif, et non le nombre de questions auxquelles l\'élève a répondu correctement.',
        scores_acc_standard_title: 'Ce que signifient les scores standards',
        scores_acc_standard_p1: 'Les scores standards facilitent la comparaison des résultats entre différentes mesures. La plupart des tests utilisent 100 comme score moyen et des intervalles de 15 points pour décrire les plages de scores.',
        scores_acc_standard_p2: 'Un score standard de 85 à 115 est généralement considéré comme dans la moyenne.',
        scores_acc_dibels_title: 'Catégories de risque DIBELS',
        scores_acc_dibels_intro: 'Les catégories DIBELS indiquent la probabilité que l\'élève atteigne les objectifs de lecture de fin d\'année correspondant à son niveau scolaire.',
        scores_dibels_blue: 'Bleu — Au-dessus du niveau de référence',
        scores_dibels_blue_desc: 'Soutien de base; risque négligeable.',
        scores_dibels_green: 'Vert — Au niveau de référence',
        scores_dibels_green_desc: 'Soutien de base; risque minimal.',
        scores_dibels_yellow: 'Jaune — Quelque risque',
        scores_dibels_yellow_desc: 'Soutien en petit groupe stratégique et suivi des progrès.',
        scores_dibels_red: 'Rouge — À risque',
        scores_dibels_red_desc: 'Soutien intensif avec suivi étroit des progrès.',


        // ── Resources section ──
        resources_section_title: 'Ressources',
        resources_section_subtitle: 'Documents de la division soutenant l\'enseignement en littératie structurée, le dépistage et le suivi des progrès',
        resources_note: 'Les documents s\'ouvrent dans un nouvel onglet. Certains liens sont hébergés sur le SharePoint du personnel de la DSLR et nécessitent une connexion.',
        resources_group_division: 'Aperçu de la division',
        resources_group_english: 'Programme anglais',
        resources_group_french: 'Français et immersion française',
        resources_link_screening: 'Dépistage en littératie et suivi des progrès à la Division scolaire Louis Riel',
        resources_link_en_k2: 'Programme anglais : portée et séquence M-2 pour la littératie structurée',
        resources_link_en_36: 'Programme anglais : portée et séquence 3e-6e année pour la littératie structurée',
        resources_link_fr_m3: 'Progression des apprentissages M-3 année',
        resources_link_fr_46: 'Progression des apprentissages 4-6 année',
        resources_link_fi_24: 'Immersion française : portée et séquence 2e-4e année pour la littératie structurée',
        resources_link_fi_56: 'Immersion française : portée et séquence 5e-6e année pour la littératie structurée',

        // ── FAQ section ──
        faq_section_title: 'FAQ',
        faq_section_subtitle: 'Réponses aux questions courantes sur le CTOPP-2, le DIBELS, le THaFol et le portail de données en littératie de la DSLR',

        // ── About section ──
        about_section_title: 'À propos',
        about_section_subtitle: 'Bienvenue dans Interventions en littératie, un guide d\'enseignement interactif de la Division scolaire Louis-Riel.',
        about_heading_purpose: 'Objectif de ce document',
        about_purpose_p1: 'Ce document est conçu pour aider les enseignants, les cliniciens, les directeurs et les directeurs adjoints à interpréter les données tout en planifiant de manière collaborative et efficace l\'enseignement et les interventions.',
        about_purpose_p2: 'Il comprend un calendrier détaillant le dépistage universel et le suivi des progrès requis à chaque niveau scolaire, tant pour les programmes d\'anglais que d\'immersion française. Il contient également du contenu interactif pour aider à interpréter les données et à déterminer les prochaines étapes.',
        about_heading_frequency: 'Fréquence du dépistage et du suivi des progrès',
        about_frequency_p1: 'En 2023, la mise à jour biennale du rapport « Droit à la lecture » de la Commission des droits de la personne de l\'Ontario recommandait d\'effectuer au moins deux dépistages par année en maternelle à la 2e année. La Commission des droits de la personne de la Saskatchewan en suggérait deux à trois par an. Les créateurs de DIBELS à l\'Université de l\'Oregon recommandent un suivi des progrès trois fois par an. L\'examen des rapports des commissions des droits de la personne, de diverses études de recherche et des consultations avec des chercheurs dans ce domaine ont éclairé le Calendrier de dépistage et de suivi des progrès adopté par la DSLR et inclus dans ce document. Le calendrier s\'applique à tous les élèves de la DSLR de la maternelle à la 8e année. Ce calendrier sera révisé annuellement pour s\'assurer que le moment et la fréquence des évaluations continuent de soutenir l\'apprentissage des élèves et les besoins des enseignants, tout en étant alignés sur les meilleures pratiques décrites dans la recherche.',
        about_heading_access: 'Accès aux données et leur importance',
        about_access_p1: 'Des rapports spécifiques ont été développés pour que les enseignants accèdent aux données de dépistage et de suivi des progrès des élèves dans Power BI. Ces rapports sont disponibles dans l\'espace de travail Power BI des enseignants. Les dirigeants scolaires et les enseignants des services aux élèves ont également accès à des rapports au niveau de l\'école et du système dans leurs espaces de travail Power BI respectifs. L\'utilisation de ces données probantes pour guider la planification pédagogique est essentielle, c\'est pourquoi le processus de dépistage est si important.',
        about_heading_rti: 'Planification de l\'intervention : RTI et MTSS',
        about_rti_p1: 'Ce document fournit un outil étape par étape qui permet aux enseignants de saisir des observations et des résultats de données, menant à des recommandations pour les prochaines étapes. La DSLR préconise fortement l\'application des principes de la Réponse à l\'intervention (RTI) et du Système de soutien à plusieurs niveaux (MTSS) pour guider toute planification d\'intervention, en veillant à ce que tous les élèves, y compris ceux ayant des difficultés de lecture ou des troubles d\'apprentissage, reçoivent un enseignement de haute qualité et un soutien ciblé.',
        about_rti_p2: 'Le RTI est un cadre proactif et axé sur les données qui aide les enseignants à prendre des décisions éclairées et à adapter l\'enseignement pour améliorer l\'apprentissage des élèves. Il suit un modèle à trois niveaux :',
        about_rti_tier1: '<strong>Palier 1 :</strong> Pratiques d\'enseignement appuyées par la recherche dans les classes régulières.',
        about_rti_tier2: '<strong>Palier 2 :</strong> Soutien ciblé pour les élèves ayant besoin d\'aide supplémentaire.',
        about_rti_tier3: '<strong>Palier 3 :</strong> Interventions intensives et individualisées pour les élèves qui continuent à éprouver des difficultés.',
        about_rti_p3: 'Le MTSS s\'appuie sur le RTI en intégrant une approche à plusieurs niveaux qui répond non seulement aux besoins académiques, mais aussi au développement social, émotionnel et comportemental. Dans le MTSS, les interventions en lecture sont classées selon leur place dans le cadre, en se concentrant sur les compétences fondamentales pour les élèves en difficulté de lecture et en utilisant des évaluations de suivi des progrès pour guider la planification des interventions.',
        about_rti_p4: 'Toutes les interventions devraient être fondées sur des données probantes ou alignées sur des méthodes d\'enseignement efficaces en classe afin de maximiser la réussite des élèves.',
        about_heading_living: 'Un document évolutif',
        about_living_p1: 'Cette ressource est un document évolutif qui sera mis à jour périodiquement. Veuillez continuer à utiliser le lien fourni pour vous assurer d\'accéder à la dernière version. Un lien est également fourni pour recueillir des commentaires. Veuillez utiliser ce lien pour partager vos commentaires afin de soutenir l\'amélioration de ce document au fil du temps.',
        about_heading_dev: 'Développement et remerciements',
        about_dev_p1: 'Ce document est le résultat d\'un effort collaboratif visant à rendre les vastes ressources disponibles sur le Portail d\'enseignement et d\'apprentissage plus pratiques et accessibles pour les éducateurs. Il est destiné à refléter les meilleures pratiques fondées sur des recherches largement acceptées, de nombreuses consultations et de nombreuses discussions avec des chercheurs, des praticiens et des spécialistes dans le domaine de l\'enseignement et des interventions en littératie fondés sur des données probantes.',
        about_dev_p2: 'La DSLR tient à remercier Rob George, Karla Gutierrez, Nicholas Kelly, Kristen McDowell, Geneviève Shyiak, Lisa Tymchuk et la Dr Caroline Erdos pour leurs contributions à cette ressource. De plus, nous devons reconnaître Cody Sellar pour sa vision et sa créativité dans la réalisation de ce projet dans son format électronique et interactif.',
        about_feedback_text: 'Nous voulons vous entendre! Dites-nous ce que vous pensez de ce projet.',
        about_feedback_btn: 'Donner votre avis',

        // ── Footer ──
        footer_text: '© 2025–2026 Literacy Interventions · Division scolaire Louis-Riel · Soutenir les éducateurs dans les interventions en littératie',

        // ── Selection history / tracker ──
        history_label: 'Historique',
        history_panel_label: 'Historique des sélections',
        history_panel_intro: 'Un registre continu de chaque évaluation approfondie et intervention que vous sélectionnez dans l\'organigramme, regroupé par session avec la date à laquelle vous avez choisi chaque élément.',
        history_panel_warning: 'Cet historique est sauvegardé uniquement dans ce navigateur. Vider le cache de votre navigateur ou les données du site effacera définitivement cet historique. Exportez en CSV pour en conserver une copie.',
        history_export_csv: 'Exporter en CSV',
        history_clear_all: 'Tout effacer',

        // ── Flowchart UI (dynamic) ──
        fc_back: 'Recommencer',
        fc_your_decisions: 'Vos décisions',
        fc_summary_view: 'Vue sommaire',
        fc_standard_view: 'Vue standard',
        fc_switch_summary: 'Passer à la vue sommaire',
        fc_switch_standard: 'Passer à la vue standard',
        fc_view_switcher: 'Changer la vue des décisions',
        fc_back_one_step: 'Revenir d\'une étape',
        fc_screener_label: 'Dépistage\u00a0:',
        fc_tier_label: 'Palier',
        fc_step_label: 'Étape',
        fc_step_of: 'sur',
        fc_in_progress: 'En cours',
        fc_coming_up: 'Prochainement',
        fc_revisit: 'Revoir',
        fc_visual_view: 'Parcours visuel',
        fc_visual_open: 'Ouvrir la vue du parcours visuel',
        fc_visual_eyebrow: 'Vue de bureau de l’organigramme',
        fc_visual_title: 'Construisez votre parcours',
        fc_visual_desc: 'Terminez chaque étape pour révéler la suite de votre parcours. Faites glisser la toile pour vous déplacer.',
        fc_visual_close: 'Fermer le parcours visuel',
        fc_visual_zoom_controls: 'Légende du parcours et commandes de zoom',
        fc_visual_effective: 'Efficace',
        fc_visual_ineffective: 'Inefficace',
        fc_visual_zoom_out: 'Réduire',
        fc_visual_zoom_in: 'Agrandir',
        fc_visual_fit: 'Ajuster le parcours à l’écran',
        fc_visual_canvas: 'Toile du parcours. Utilisez les touches fléchées pour vous déplacer.',
        fc_visual_fullscreen: 'Passer en plein écran',
        fc_visual_fullscreen_exit: 'Quitter le plein écran',
        fc_visual_tier_collapsed: (n, count) => `Palier ${n} · ${count} étape${count !== 1 ? 's' : ''} · Toucher pour développer`,
        fc_visual_tier_collapse: 'Réduire ce palier',
        fc_visual_tier_review_label: 'Révisez avant de continuer',

        // ── Flowchart program / language mini selector (shown beside the flowchart) ──
        fc_program_mini_label: 'Programme',
        fc_language_mini_label: 'Langue',
        fc_program_english: 'Anglais',
        fc_program_french_immersion: 'Immersion française',
        fc_language_english: 'Anglais',
        fc_language_french: 'Français',
        fc_program_change_confirm: 'Changer de programme réinitialisera l\u2019organigramme depuis le début et effacera votre progression actuelle. Continuer\u00a0?',

        // ── Step type labels ──
        step_type_check: 'Vérifier',
        step_type_choose: 'Choisir',
        step_type_decide: 'Décider',
        step_type_read: 'Lire',
        step_type_outcome: 'Résultat',
        step_type_step: 'Étape',
        step_type_reviewed: 'Examiné',

        // ── Tier transition ──
        go_to_tier: 'Aller au palier',
        go_to_tier_note: 'Vous passez au prochain palier de soutien.',
        continue_to_tier: 'Continuer vers le palier',
        moving_to_tier: 'Passage au palier',
        tier1_sidebar_heading: 'Comment détermine-t-on si l\'enseignement est efficace ou inefficace?',
        tier1_blue_green_label: 'Indicateurs bleu et vert',
        tier1_blue_green_desc: 'Si les résultats de dépistage de l\'élève indiquent Bleu ou Vert dans tous les domaines, l\'enseignement est efficace.',
        tier1_yellow_red_label: 'Indicateurs jaune et rouge',
        tier1_yellow_red_desc: 'Si les résultats de dépistage de l\'élève indiquent Jaune ou Rouge dans un domaine quelconque, l\'enseignement est inefficace.',
        tier1_monitoring_note: 'Un suivi et des interventions sont nécessaires.',
        tier1_see_scores: 'Voir Comprendre les scores et les percentiles',

        // ── Route complete gate ──
        gate_title: 'Parcours terminé',
        gate_subtitle_steps: (n) => `Vous avez complété ${n} étape${n !== 1 ? 's' : ''} dans`,
        gate_desc: 'Cliquez ci-dessous pour voir un résumé visuel de votre parcours d\'intervention complet.',
        gate_view_summary: 'Voir le résumé du parcours',
        anim_skip: 'Passer l\'animation',

        // ── Recommendations ──
        recommendations_title: 'Recommandations',
        go_back: 'Retour',

        // ── Tier labels (tabs and name bar) ──
        tier1_label: 'Palier 1',
        tier2_label: 'Palier 2',
        tier3_label: 'Palier 3',
        tier_toggle_group_label: 'Palier',

        // ── Check all ──
        check_all: 'Tout cocher',
        uncheck_all: 'Tout décocher',
        all_reviewed: (n) => `Les ${n} principes ont été examinés ✓`,

        // ── Journey map count ──
        journey_step_count: (n) => `Étape ${n}`,
        journey_step_of: (n, total) => `Étape ${n} sur ${total}`,
        journey_complete: 'Terminé',

        // ── Final summary ──
        final_summary_close: 'Fermer le résumé',
        tier_complete: 'Palier terminé',

        // ── Evidence popup ──
        evidence_eb_title: '* Fondé sur des données probantes : Le plus rigoureux et fiable',
        evidence_eb_desc: 'Définition : Le programme ou la pratique a été testé dans le cadre de recherches évaluées par des pairs de haute qualité (souvent des essais contrôlés randomisés ou des études quasi-expérimentales) et a démontré des résultats positifs statistiquement significatifs.',
        evidence_rb_title: '** Fondé sur la recherche : Moins rigoureux que fondé sur des données probantes',
        evidence_rb_desc: 'Définition : Le programme est fondé sur des théories ou méthodes solides validées par certaines recherches, mais le programme lui-même n\'a peut-être pas été directement étudié pour des preuves de son efficacité.',
        evidence_legend_label: '* Fondé sur des données probantes / ** Fondé sur la recherche',
        evidence_legend_aria: 'Définitions fondées sur des données probantes et la recherche',

        // ── FW results ──
        fw_no_results: 'Aucun élément correspondant aux critères sélectionnés.',
        fw_results_label: (n) => `${n} résultat${n !== 1 ? 's' : ''}`,
        fw_time_prefix: 'Durée\u00a0:',
        fw_grade_prefix: 'Année',
    }
};

// ============================================
// French Flowchart Definitions
// (Assessment Names, Screener Names, and Intervention Names are NOT translated)
// ============================================
const FLOWCHART_DEFINITIONS_FR = {
    tier1: {
        title: 'Palier UN\u00a0: Classe universelle',
        startNode: 'tier1-principles',
        nodes: {
            'tier1-principles': {
                id: 'tier1-principles',
                type: 'checklist',
                title: '\u00c9tape 1\u00a0: Principes de l\u2019enseignement explicite et syst\u00e9matique',
                description: 'Examinez les principes suivants avant de continuer.',
                items: [
                    'Les objectifs de la le\u00e7on sont-ils clairement \u00e9nonc\u00e9s\u00a0?',
                    'Le contenu est-il pr\u00e9sent\u00e9 en \u00e9tapes compr\u00e9hensibles et logiquement ordonn\u00e9es, guid\u00e9 par la Progression des apprentissages de la DSLR\u00a0?',
                    'Une r\u00e9troaction corrective imm\u00e9diate est-elle fournie\u00a0?',
                    'La pratique guid\u00e9e et soutenue est-elle suffisante pour mener \u00e0 une application fluide\u00a0?',
                    'Les activit\u00e9s sont-elles utilis\u00e9es pour atteindre des objectifs sp\u00e9cifiques\u00a0?',
                    'Y a-t-il un plan pour r\u00e9enseigner au besoin\u00a0?',
                    'Les progr\u00e8s sont-ils suivis\u00a0?',
                    'L\u2019enseignement int\u00e8gre-t-il la conception simple de la lecture\u00a0?'
                ],
                nextNode: 'tier1-screener',
                buttonText: 'Continuer vers le d\u00e9pistage en litt\u00e9ratie'
            },
            'tier1-screener': {
                id: 'tier1-screener',
                type: 'selection',
                title: '\u00c9tape 2\u00a0: D\u00e9pistage en litt\u00e9ratie',
                subtitle: '',
                description: '',
                options: 'screeners',
                nextNode: 'tier1-effectiveness',
                nextHandler: 'selectTier1ScreenerVisual'
            },
            'tier1-effectiveness': {
                id: 'tier1-effectiveness',
                type: 'decision',
                title: '\u00c9tape 3\u00a0: R\u00e9sultat',
                subtitle: 'L\u2019enseignement \u00e9tait-il efficace\u00a0?',
                description: '',
                choices: [
                    { id: 'effective', label: 'Enseignement efficace', sublabel: 'R\u00e9sultat du sous-test Bleu ou Vert', indicators: ['blue', 'green'], type: 'success', nextNode: 'tier1-success' },
                    { id: 'ineffective', label: 'Enseignement inefficace', sublabel: 'R\u00e9sultat du sous-test Jaune ou Rouge', indicators: ['yellow', 'red'], type: 'warning', nextNode: 'tier1-percentage' }
                ]
            },
            'tier1-success': {
                id: 'tier1-success',
                type: 'endpoint',
                status: 'success',
                title: 'Enseignement efficace\u00a0!',
                description: 'Continuer et suivre avec le curriculum g\u00e9n\u00e9ral.'
            },
            'tier1-percentage': {
                id: 'tier1-percentage',
                type: 'decision',
                title: 'Voie B\u00a0: Enseignement inefficace',
                subtitle: 'Quel pourcentage d\u2019\u00e9l\u00e8ves est en difficult\u00e9\u00a0?',
                description: 'D\u2019apr\u00e8s les r\u00e9sultats du d\u00e9pistage, combien d\u2019\u00e9l\u00e8ves sont en dessous du niveau de r\u00e9f\u00e9rence\u00a0?',
                choices: [
                    { id: 'more-20', label: '20\u00a0% ou plus', icon: '▲', sublabel: '', type: 'warning', nextNode: 'tier1-reteach' },
                    { id: 'less-20', label: 'Moins de 20\u00a0%', icon: '▼', sublabel: '', type: 'warning', nextNode: 'tier1-move-tier2' }
                ]
            },
            'tier1-move-tier2': {
                id: 'tier1-move-tier2',
                type: 'endpoint',
                status: 'info',
                title: 'Continuer vers le palier 2\u00a0: Interventions en petits groupes',
                description: '',
                actionButton: { text: 'D\u00e9marrer l\u2019organigramme du palier 2', action: 'startTier2Visual' }
            },
            'tier1-reteach': {
                id: 'tier1-reteach',
                type: 'endpoint',
                status: 'warning',
                title: 'Réenseigner le curriculum général',
                descriptionHtml: 'Considérez les points faibles identifiés par le dépistage en littératie. Utilisez le <a href="#interventions" onclick="navigateToPage(\'interventions\'); return false;">menu des interventions</a> pour trouver des ressources.',
                actionButton: { text: 'Recommencer le palier 1', action: 'restartTier1Visual' }
            }
        }
    },
    tier2: {
        title: 'Palier DEUX\u00a0: Intervention en petits groupes',
        startNode: 'tier2-principles',
        nodes: {
            'tier2-principles': {
                id: 'tier2-principles',
                type: 'checklist',
                title: '\u00c9tape 1\u00a0: Entr\u00e9e',
                journeySummary: 'Vous avez \u00e9cart\u00e9 les d\u00e9ficiences et autres obstacles comme cause des difficult\u00e9s en litt\u00e9ratie et confirm\u00e9 que les soutiens du palier 2 ont \u00e9t\u00e9 mis en place correctement.',
                reviewHint: 'Utilisez la carte du processus pour rouvrir cette \u00e9tape et revoir la liste en tout temps.',
                leadText: 'Inform\u00e9 par des donn\u00e9es (voir les outils de suivi des progr\u00e8s).',
                subtitle: '\u00c9carter que les d\u00e9fis ne sont pas le r\u00e9sultat de\u00a0:',
                items: [
                    'D\u00e9ficiences visuelles',
                    'D\u00e9ficiences auditives',
                    'Absences fr\u00e9quentes',
                    'Apprenant multilingue (ALM)',
                    'Autre diagnostic'
                ],
                postSections: [
                    {
                        title: 'Information sur le groupe',
                        items: [
                            'Dirig\u00e9 par les enseignants de la classe.',
                            'Environ 3 \u00e0 5 \u00e9l\u00e8ves par groupe.',
                            'Les \u00e9l\u00e8ves re\u00e7oivent un enseignement intensif, explicite et syst\u00e9matique en petits groupes bas\u00e9 sur des objectifs sp\u00e9cifiques en litt\u00e9ratie (pas n\u00e9cessairement au niveau de la classe), fond\u00e9s sur les cinq piliers de l\u2019enseignement de la lecture identifi\u00e9s par les enseignants, les services aux \u00e9l\u00e8ves et les administrateurs.',
                            'Les interventions sont mises en \u0153uvre pour une p\u00e9riode sugg\u00e9r\u00e9e de 20 \u00e0 40 minutes, trois \u00e0 cinq fois par semaine sur une p\u00e9riode de 8 semaines.'
                        ]
                    },
                    {
                        title: 'Suivi des progr\u00e8s',
                        items: [
                            'Suivi hebdomadaire des progr\u00e8s (ex.\u00a0: \u00e9valuations de suivi des progr\u00e8s UFLI, DIBELS).'
                        ]
                    },
                    {
                        title: 'Collaboration',
                        items: [
                            'Les membres de l\u2019\u00e9quipe partagent les r\u00e9sultats du suivi des progr\u00e8s lors des r\u00e9unions \u00e0 l\u2019\u00e9cole.'
                        ]
                    }
                ],
                nextNode: 'tier2-assessment',
                buttonText: 'Continuer vers l\u2019\u00e9valuation approfondie',
                useButton: true
            },
            'tier2-assessment': {
                id: 'tier2-assessment',
                type: 'selection',
                title: '\u00c9tape 2\u00a0: \u00c9valuation approfondie',
                subtitle: 'Administrer une \u00e9valuation approfondie.',
                description: 'Utilisez le menu ci-dessous pour trouver et administrer une \u00e9valuation approfondie correspondant aux besoins de vos \u00e9l\u00e8ves, tels que d\u00e9termin\u00e9s par le d\u00e9pistage en litt\u00e9ratie.',
                options: 'drillDownAssessments',
                nextNode: 'tier2-intervention',
                nextHandler: 'selectTier2AssessmentVisual'
            },
            'tier2-intervention': {
                id: 'tier2-intervention',
                type: 'selection',
                title: '\u00c9tape 3\u00a0: Intervention de 8 semaines',
                subtitle: 'S\u00e9lectionner et administrer une intervention de 8 semaines.',
                description: 'Utilisez le menu ci-dessous pour trouver une intervention appropri\u00e9e, suivez la r\u00e9ponse de l\u2019\u00e9l\u00e8ve avec des outils de suivi des progr\u00e8s (si n\u00e9cessaire) et administrez-la pendant une p\u00e9riode de 8 semaines.',
                options: 'interventions',
                nextNode: 'tier2-progress',
                nextHandler: 'selectTier2InterventionVisual'
            },
            'tier2-progress': {
                id: 'tier2-progress',
                type: 'decision',
                title: '\u00c9tape 4\u00a0: Suivi des progr\u00e8s',
                subtitle: 'L\u2019enseignement \u00e9tait-il efficace\u00a0?',
                description: 'Apr\u00e8s la p\u00e9riode de 8 semaines, administrer l\u2019outil de d\u00e9pistage de suivi des progr\u00e8s en litt\u00e9ratie planifi\u00e9 (DIBELS, CTOPP-2, THaFol, IDAPEL).\n\nSi vous avez choisi la mauvaise option, choisissez simplement la bonne et continuez.',
                choices: [
                    { id: 'improved', label: 'Enseignement efficace', sublabel: 'R\u00e9sultat du sous-test Bleu ou Vert', type: 'success', nextNode: 'tier2-success' },
                    { id: 'no-improvement', label: 'Enseignement inefficace', sublabel: 'R\u00e9sultat du sous-test Jaune ou Rouge', type: 'warning', nextNode: 'tier2-cycle2-assessment' }
                ]
            },
            'tier2-success': {
                id: 'tier2-success',
                type: 'endpoint',
                status: 'success',
                title: '\u00c9tape 5\u00a0: Succ\u00e8s\u00a0!',
                description: 'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.',
                recommendations: [
                    'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.'
                ]
            },
            'tier2-cycle2-assessment': {
                id: 'tier2-cycle2-assessment',
                type: 'selection',
                title: '\u00c9tape 5\u00a0: \u00c9valuation approfondie',
                subtitle: 'Administrer une deuxi\u00e8me \u00e9valuation approfondie.',
                description: 'Utilisez \u00e0 nouveau le menu pour trouver et administrer une \u00e9valuation approfondie correspondant aux besoins de vos \u00e9l\u00e8ves, tels que d\u00e9termin\u00e9s par le dernier d\u00e9pistage en litt\u00e9ratie.',
                options: 'drillDownAssessments',
                nextNode: 'tier2-cycle2-intervention',
                nextHandler: 'selectTier2AssessmentVisual'
            },
            'tier2-cycle2-intervention': {
                id: 'tier2-cycle2-intervention',
                type: 'selection',
                title: '\u00c9tape 6\u00a0: Intervention de 8 semaines',
                subtitle: 'Modifier ou continuer les interventions du palier 2.',
                description: 'Modifier ou continuer les interventions du palier 2 et suivre r\u00e9guli\u00e8rement la r\u00e9ponse de l\u2019\u00e9l\u00e8ve \u00e0 l\u2019intervention avec des outils de suivi des progr\u00e8s (si n\u00e9cessaire).',
                options: 'interventions',
                nextNode: 'tier2-cycle2-progress',
                nextHandler: 'selectTier2InterventionVisual'
            },
            'tier2-cycle2-progress': {
                id: 'tier2-cycle2-progress',
                type: 'decision',
                title: '\u00c9tape 7\u00a0: Suivi des progr\u00e8s',
                subtitle: 'L\u2019enseignement \u00e9tait-il efficace\u00a0?',
                description: 'Apr\u00e8s la p\u00e9riode de 8 semaines, administrer l\u2019outil de d\u00e9pistage de suivi des progr\u00e8s en litt\u00e9ratie planifi\u00e9 (DIBELS, CTOPP-2, THaFol, IDAPEL).\n\nSi vous avez choisi la mauvaise option, choisissez simplement la bonne et continuez.',
                choices: [
                    { id: 'improved', label: 'Enseignement efficace', sublabel: 'R\u00e9sultat du sous-test Bleu ou Vert', type: 'success', nextNode: 'tier2-cycle2-success' },
                    { id: 'no-improvement', label: 'Enseignement inefficace', sublabel: 'R\u00e9sultat du sous-test Jaune ou Rouge', type: 'warning', nextNode: 'tier2-move-tier3' }
                ]
            },
            'tier2-cycle2-success': {
                id: 'tier2-cycle2-success',
                type: 'endpoint',
                status: 'success',
                title: '\u00c9tape 8\u00a0: Succ\u00e8s\u00a0!',
                description: 'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.',
                recommendations: [
                    'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.'
                ]
            },
            'tier2-move-tier3': {
                id: 'tier2-move-tier3',
                type: 'endpoint',
                status: 'info',
                title: '\u00c9tape 8\u00a0: Passer au palier 3',
                description: 'Si l\u2019\u00e9l\u00e8ve ne fait pas de progr\u00e8s attendus au palier 2 apr\u00e8s deux cycles d\u2019intervention de 8 semaines, il passe au palier 3. Moins de 10\u00a0% des \u00e9l\u00e8ves devraient avoir besoin du palier 3.\n\nCe parcours continue vers l\u2019organigramme du palier trois.',
                recommendations: [
                    'Continuer vers l\u2019organigramme du palier trois.'
                ],
                actionButton: { text: 'D\u00e9marrer l\u2019organigramme du palier 3', action: 'startTier3Visual' }
            }
        }
    },
    tier3: {
        title: 'Palier TROIS\u00a0: Intervention personnalis\u00e9e',
        startNode: 'tier3-intro',
        nodes: {
            'tier3-intro': {
                id: 'tier3-intro',
                type: 'info',
                title: 'Information sur l\u2019entr\u00e9e',
                subtitle: 'Examinez les informations suivantes avant de continuer.',
                sections: [
                    {
                        title: 'Entr\u00e9e',
                        items: [
                            'Scores composites DIBELS en dessous du niveau de r\u00e9f\u00e9rence.',
                            'Minimum de deux p\u00e9riodes de 8 semaines d\u2019interventions du palier 2.',
                            'Progr\u00e8s minimes dans les interventions du palier 2, mesur\u00e9s par les \u00e9valuations DIBELS et le suivi des progr\u00e8s UFLI.',
                            'Diagnostic li\u00e9 \u00e0 la lecture (p.\u00a0ex.\u00a0: trouble d\u2019apprentissage sp\u00e9cifique en lecture, c.-\u00e0-d. dyslexie) OU inscrit sur la liste pour un diagnostic potentiel.'
                        ]
                    },
                    {
                        title: 'Information sur le groupe',
                        items: [
                            '1 \u00e0 3 \u00e9l\u00e8ves par groupe.',
                            'Intervention fournie par un enseignant form\u00e9 en litt\u00e9ratie structur\u00e9e et en administration d\u2019enseignement direct.',
                            'Les \u00e9l\u00e8ves travaillent vers des objectifs individualis\u00e9s (jusqu\u2019\u00e0 3) cr\u00e9\u00e9s par l\u2019enseignant d\u2019intervention et consign\u00e9s dans le plan sp\u00e9cifique \u00e0 l\u2019\u00e9l\u00e8ve.',
                            'Les \u00e9l\u00e8ves re\u00e7oivent un enseignement sp\u00e9cialis\u00e9 bas\u00e9 sur leurs objectifs sp\u00e9cifiques.',
                            'S\u00e9ances de 25 minutes, minimum 4 \u00e0 5 fois par semaine.',
                            'Les \u00e9l\u00e8ves dont les absences nuisent \u00e0 leur capacit\u00e9 \u00e0 recevoir 4 \u00e0 5 le\u00e7ons par semaine peuvent \u00eatre retir\u00e9s et replac\u00e9s dans une intervention du palier 2 \u00e0 la discr\u00e9tion de l\u2019administrateur.'
                        ]
                    },
                    {
                        title: 'Suivi des progr\u00e8s',
                        items: [
                            'Les interventions sont mises en \u0153uvre pour un minimum de 8 semaines.',
                            'Suivi des progr\u00e8s effectu\u00e9 chaque semaine.',
                            'Suivi universel des progr\u00e8s \u00e0 l\u2019\u00e9chelle de la division compl\u00e9t\u00e9 \u00e0 la 8e semaine.'
                        ]
                    },
                    {
                        title: 'Collaboration',
                        items: [
                            'Les parents sont inform\u00e9s par lettre que leur enfant recevra des interventions du palier 3.',
                            'Les membres de l\u2019\u00e9quipe partagent les r\u00e9sultats du suivi des progr\u00e8s lors des r\u00e9unions \u00e0 l\u2019\u00e9cole.',
                            'Les membres de l\u2019\u00e9quipe consultent et collaborent avec le psychologue scolaire, l\u2019orthophoniste et l\u2019ergoth\u00e9rapeute.'
                        ]
                    }
                ],
                nextNode: 'tier3-assessment',
                buttonText: 'J\u2019ai pris connaissance de ces informations'
            },
            'tier3-assessment': {
                id: 'tier3-assessment',
                type: 'selection',
                title: '\u00c9tape 1\u00a0: \u00c9valuation approfondie',
                subtitle: 'Administrer une \u00e9valuation approfondie.',
                description: 'Utilisez le menu ci-dessous pour trouver et administrer une \u00e9valuation approfondie correspondant aux besoins de vos \u00e9l\u00e8ves, tels que d\u00e9termin\u00e9s par le d\u00e9pistage en litt\u00e9ratie.',
                options: 'drillDownAssessments',
                nextNode: 'tier3-intervention',
                nextHandler: 'selectTier3AssessmentVisual'
            },
            'tier3-intervention': {
                id: 'tier3-intervention',
                type: 'selection',
                title: '\u00c9tape 2\u00a0: Intervention de 8 semaines',
                subtitle: 'S\u00e9lectionner et administrer une intervention de 8 semaines.',
                description: 'Utilisez le menu ci-dessous pour trouver une intervention appropri\u00e9e et l\u2019administrer pendant une p\u00e9riode de 8 semaines. Suivez hebdomadairement la r\u00e9ponse de l\u2019\u00e9l\u00e8ve \u00e0 l\u2019intervention.',
                options: 'interventions',
                nextNode: 'tier3-progress',
                nextHandler: 'selectTier3InterventionVisual'
            },
            'tier3-progress': {
                id: 'tier3-progress',
                type: 'decision',
                title: '\u00c9tape 3\u00a0: Suivi des progr\u00e8s',
                subtitle: 'L\u2019enseignement \u00e9tait-il efficace\u00a0?',
                description: 'Apr\u00e8s la p\u00e9riode de 8 semaines, administrer l\u2019outil de d\u00e9pistage de suivi des progr\u00e8s en litt\u00e9ratie planifi\u00e9 (DIBELS, CTOPP-2, THaFol, IDAPEL).\n\nSi vous avez choisi la mauvaise option, choisissez simplement la bonne et continuez.',
                choices: [
                    { id: 'improved', label: 'Enseignement efficace', sublabel: 'R\u00e9sultat du sous-test Bleu ou Vert', type: 'success', nextNode: 'tier3-success' },
                    { id: 'no-improvement', label: 'Enseignement inefficace', sublabel: 'R\u00e9sultat du sous-test Jaune ou Rouge', type: 'warning', nextNode: 'tier3-specialist' }
                ]
            },
            'tier3-success': {
                id: 'tier3-success',
                type: 'endpoint',
                status: 'success',
                title: '\u00c9tape 4\u00a0: Succ\u00e8s\u00a0!',
                description: 'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.',
                recommendations: [
                    'Envisager de r\u00e9duire progressivement les soutiens au palier 1 et de surveiller.'
                ]
            },
            'tier3-specialist': {
                id: 'tier3-specialist',
                type: 'endpoint',
                status: 'warning',
                title: '\u00c9tape 4\u00a0: Rencontrer les cliniciens',
                description: 'Rencontrer les cliniciens appropri\u00e9s pour discuter des prochaines \u00e9tapes.'
            }
        }
    }
};

// ============================================
// French Node Summaries (used in journey animation)
// ============================================
const NODE_SUMMARIES_FR = {
    'tier1-principles': {
        text: 'Vous avez confirm\u00e9 que l\u2019enseignement en classe respecte les principes de l\u2019enseignement explicite et syst\u00e9matique\u00a0\u2014 les bases sont solides\u00a0! 📚',
        variant: 'step1'
    },
    'tier1-screener': {
        text: (choice) => `Vous avez administr\u00e9 ${choice || 'l\u2019outil de d\u00e9pistage en litt\u00e9ratie'} pour mesurer o\u00f9 en sont les \u00e9l\u00e8ves. Place aux donn\u00e9es\u00a0! 📊`,
        variant: 'selection'
    },
    'tier1-effectiveness': {
        effective:   { text: 'L\u2019outil de d\u00e9pistage indique Bleu ou Vert\u00a0\u2014 cet \u00e9l\u00e8ve est sur la bonne voie et l\u2019enseignement fonctionne\u00a0! 🎉', variant: 'effective' },
        ineffective: { text: 'L\u2019outil de d\u00e9pistage indique Jaune ou Rouge\u00a0\u2014 l\u2019enseignement doit \u00eatre ajust\u00e9 pour cet \u00e9l\u00e8ve. 📋', variant: 'ineffective' }
    },
    'tier1-percentage': {
        'more-20':   { text: 'Plus de 20\u00a0% des \u00e9l\u00e8ves ne sont pas au niveau de r\u00e9f\u00e9rence\u00a0\u2014 cela indique un besoin de r\u00e9enseigner l\u2019enseignement de base avec des strat\u00e9gies ajust\u00e9es. 🔄', variant: 'ineffective' },
        'less-20':   { text: 'Moins de 20\u00a0% des \u00e9l\u00e8ves ont besoin d\u2019aide suppl\u00e9mentaire\u00a0\u2014 la prochaine \u00e9tape est un soutien cibl\u00e9 en petits groupes au palier 2. 📊', variant: 'ineffective' }
    },
    'tier2-principles': {
        text: 'Vous avez \u00e9cart\u00e9 les d\u00e9ficiences visuelles, auditives, les absences, la langue et d\u2019autres obstacles\u00a0\u2014 l\u2019\u00e9l\u00e8ve est pr\u00eat pour une intervention cibl\u00e9e au palier 2\u00a0! ✅',
        variant: 'step1'
    },
    'tier2-assessment': {
        text: (choice) => `Vous avez s\u00e9lectionn\u00e9 ${choice || 'une \u00e9valuation approfondie'} pour cibler pr\u00e9cis\u00e9ment les comp\u00e9tences en litt\u00e9ratie qui ont le plus besoin de soutien. 🔍`,
        variant: 'selection'
    },
    'tier2-intervention': {
        text: (choice) => `Vous avez choisi ${choice || 'un programme d\u2019intervention'} pour le cycle d\u2019intervention de 8 semaines\u00a0\u2014 le travail intensif en petit groupe commence\u00a0! 💪`,
        variant: 'selection'
    },
    'tier2-progress': {
        effective:        { text: 'Apr\u00e8s le cycle de 8 semaines, le d\u00e9pistage indique Bleu ou Vert\u00a0\u2014 l\u2019intervention a fonctionn\u00e9\u00a0! Quel beau r\u00e9sultat\u00a0! 🌟', variant: 'effective' },
        'no-improvement': { text: 'Apr\u00e8s 8 semaines, les r\u00e9sultats indiquent encore Jaune ou Rouge\u00a0\u2014 l\u2019\u00e9l\u00e8ve a besoin d\u2019un autre cycle avant de r\u00e9\u00e9valuer. 📋', variant: 'ineffective' }
    },
    'tier2-cycle2-assessment': {
        text: (choice) => `Vous avez s\u00e9lectionn\u00e9 ${choice || 'une \u00e9valuation approfondie'} pour le deuxi\u00e8me cycle\u00a0\u2014 obtenons un portrait encore plus pr\u00e9cis. 🔍`,
        variant: 'selection'
    },
    'tier2-cycle2-intervention': {
        text: (choice) => `Vous avez choisi ${choice || 'un programme d\u2019intervention'} pour le deuxi\u00e8me cycle de 8 semaines\u00a0\u2014 ajust\u00e9 et pr\u00eat\u00a0! 💪`,
        variant: 'selection'
    },
    'tier2-cycle2-progress': {
        effective:        { text: 'Le deuxi\u00e8me cycle d\u2019intervention a port\u00e9 ses fruits\u00a0\u2014 les r\u00e9sultats de l\u2019\u00e9l\u00e8ve sont maintenant Bleu ou Vert\u00a0! Il est temps d\u2019envisager un retour au palier 1. 🎉', variant: 'effective' },
        'no-improvement': { text: 'Apr\u00e8s deux cycles complets, l\u2019\u00e9l\u00e8ve a besoin d\u2019un soutien plus intensif et personnalis\u00e9\u00a0\u2014 on passe au palier 3. 📋', variant: 'ineffective' }
    },
    'tier3-intro': {
        text: 'Vous avez examin\u00e9 les crit\u00e8res d\u2019entr\u00e9e du palier 3 et confirm\u00e9 que cet \u00e9l\u00e8ve r\u00e9pond aux exigences d\u2019une intervention intensive et personnalis\u00e9e. 📋',
        variant: 'step1'
    },
    'tier3-assessment': {
        text: (choice) => `Vous avez s\u00e9lectionn\u00e9 ${choice || 'une \u00e9valuation approfondie'} pour guider le plan d\u2019intervention individualis\u00e9 du palier 3. 🔍`,
        variant: 'selection'
    },
    'tier3-intervention': {
        text: (choice) => `Vous avez choisi ${choice || 'un programme d\u2019intervention intensif'} pour des s\u00e9ances personnalis\u00e9es en petit groupe au palier 3\u00a0\u2014 chaque minute compte\u00a0! 💪`,
        variant: 'selection'
    },
    'tier3-progress': {
        effective:        { text: 'Les interventions du palier 3 font vraiment la diff\u00e9rence\u00a0\u2014 les r\u00e9sultats de l\u2019\u00e9l\u00e8ve sont maintenant Bleu ou Vert\u00a0! Discutons des prochaines \u00e9tapes. 🌟', variant: 'effective' },
        'no-improvement': { text: 'L\u2019\u00e9l\u00e8ve a besoin d\u2019un soutien continu au palier 3 et d\u2019un examen plus approfondi avec des sp\u00e9cialistes. L\u2019\u00e9quipe est l\u00e0 pour lui\u00a0! 📋', variant: 'ineffective' }
    }
};
