# Literacy Translation Reference

## App tutorials

Find the tours under Resource Centre → Help & Background → App tutorials.
Keep the English and French titles, instructions, and examples in `tutorial.js`
in sync. Shared tour labels and the DIBELS explanation are in `translations.js`.
The Resource Centre & Settings tour shows each section's navigation button
before opening its content. It offers Next for optional actions and explanations;
the other tours advance on the highlighted action.

## Literacy Pillars

| English | French |
|---|---|
| Alphabetic Principle | Le principe alphabétique |
| Phonemic Awareness | La conscience phonémique |
| Phonics | La phonétique |
| Reading Fluency | La fluidité de lecture |
| Vocabulary | Le vocabulaire |
| Reading Comprehension | La compréhension de lecture |
| Orthography | L’orthographe |

### Pillar definitions

`data/intervention-menu.json` is the shared source for the Literacy Pillars
reference page and contextual help in the flowchart and Literacy Toolkit.
Each pillar has an English `definition` and a French `definition_fr`; keep both
in sync when updating approved content. English definitions preserve the supplied
wording. Existing references to the five pillars of reading instruction remain
unchanged; the guide covers all seven categories used by the toolkit.

Contextual help expands selected pillars without changing filters or pathway
progress. Closing the native dialog (including with Escape) returns focus to its
trigger. Definitions can also be opened independently under Reference resources.

## Resource Types

| English | French |
|---|---|
| Instructional Resource | Ressource pour l’enseignement |
| Drill Down Assessment | Évaluation approfondie |
| Intervention | Ressource pour les interventions |
