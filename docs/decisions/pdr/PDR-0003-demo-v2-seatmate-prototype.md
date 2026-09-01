---
id: PDR-0003
status: Accepted
date: 2026-09-01
owner: Current User
scope: Demo V2 experience proof
supersedes: [PDR-0001]
---

# Demo V2 includes a disclosed Mock Seatmate prototype

## Context / User Problem

The Classroom currently ends at Student exploration. Demo V2 must prove that a user's Candidate Seat can create a meaningful nearby interaction object without expanding into a social system or real conversational Agent.

## Constraints and Evidence

- Candidate remains a sample-bounded, evidence-backed location and never means novelty or mastery.
- The current implementation has no Candidate API or state machine; backend and contracts are explicitly out of scope for this iteration.
- The current user instruction permits one Golden Question, Golden Note, Golden Seatmate, and deterministic interaction.

## Options (include “keep current”)

- Keep Seatmate deferred: fails the Demo V2 requirement.
- Build a real chat API: exceeds scope and weakens reliability.
- Use a disclosed deterministic Scenario in the existing Classroom: proves the experience with low risk.

## Decision

Demo V2 includes one clearly disclosed Mock Seatmate prototype. It begins from a Golden sample note, reveals Candidate Seat in the current Classroom, identifies the adjacent Student, explains “why worth talking” without a numeric match score, and supports one deterministic question/response exchange. It is not a real user, Agent, social feature, or free chat.

## Consequences and Guardrails

- Mock data remains under `data/fixtures`, never `data/snapshots`.
- UI states are discriminated and local to the Demo experience.
- The Student continues to represent one synthetic source, not a personality inferred from a real author.
- Candidate copy retains “与问题相关 / 来自你的笔记 / 当前覆盖较少” and the sample-bounded disclosure.

## Migration / Rollback Cost

Later work may replace the Scenario with frozen Candidate/Seatmate contracts. Until then no Mock response may be presented as live AI.

## Verification / Revisit Trigger

Revisit before adding arbitrary notes, free-form multi-turn chat, persistent identity, or a real Seatmate API.

## Related Specs / Tasks

PROP-0002, PDR-0002, UXDR-0001, UXDR-0003, TASK-013.
