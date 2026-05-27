# AI Features Design (VetHaul)

AI is used to reduce friction and manual work, not to add complexity.

---

## Guiding Principle

AI should:
- increase conversion
- reduce manual quoting
- improve response speed

NOT:
- create unnecessary complexity
- require heavy infrastructure early

---

## 1. Photo-Based Pricing

Input:
- user uploads image

Process:
- AI detects:
  - item types
  - approximate volume
- map to load size

Output:
- estimated price range

Fallback:
- if confidence low → flag for manual review

---

## 2. AI SMS Assistant

Handles:
- “how much for couch?”
- “do you service my area?”
- “can you come today?”

Flow:
- incoming SMS → AI → response
- grounded with:
  - pricing rules
  - service area

---

## 3. AI Lead Scoring

Inputs:
- service type
- estimated value
- keywords

Output:
- priority:
  - high
  - medium
  - low

Use:
- prioritize responses
- trigger alerts

---

## 4. AI Quote Builder

Combines:
- form input
- photo analysis
- notes

Outputs:
- structured quote text
- price range

---

## Implementation Notes

- start with API-based AI (OpenAI or similar)
- do NOT build custom ML models
- log all AI outputs for review
- allow manual override

---

## Phase Gating

- Phase 4 only
- Do NOT implement before:
  - booking system works
  - data model stable