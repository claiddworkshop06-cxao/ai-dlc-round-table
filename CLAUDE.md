# Claude Code Common Rules

In this repository, artifacts (documents) are created/updated only in the following locations:
- `aidlc-docs/` (Intent/Requirements/NFR/Plans/Design/User Stories)
- `UNITS/` (Unit/Bolt artifacts)

## Language Setting
Output language: See `.aidlc/config.json` for `language` setting.

## Question Rules
When there is ambiguity, branching, or a choice required, always use **askQuestionTool** to confirm with the user before proceeding.
(Do not proceed based on assumptions.)
