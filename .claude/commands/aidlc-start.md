---
description: Start AI-DLC with natural language. The orchestrator investigates and confirms with askQuestionTool before proceeding.
---

# /aidlc-start

Arguments:
- {arg1}: What you want to do (natural language OK)

## Execution
1. Read `.aidlc/config.json` to get the language setting
2. Search existing `aidlc-docs/` and `UNITS/` for related intent/unit/bolt candidates
3. Use askQuestionTool to confirm:
   - Is this work treated as Intent / Unit / Bolt?
   - Target Unit (select existing or create new)
   - Is Bolt newly created? (new by default)
4. Proceed with the AI-DLC workflow based on user's answers

## Output Language
Generate all outputs in the language specified in `.aidlc/config.json`.
