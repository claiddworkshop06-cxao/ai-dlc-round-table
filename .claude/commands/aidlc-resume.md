---
description: Resume AI-DLC from an interrupted state (orchestrator-led)
---

# /aidlc-resume

## Execution
1. Read `.aidlc/config.json` to get the language setting
2. Check existing artifacts (`aidlc-docs/` and `UNITS/`) and organize incomplete items
3. Confirm unclear points using askQuestionTool
4. Resume from the last checkpoint

## Output Language
Generate all outputs in the language specified in `.aidlc/config.json`.
