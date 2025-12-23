# # Initialize Project – Mobile Client Foundation

\## Goal

Initialize the VideoSpliter project with a clean, scalable React Native + TypeScript foundation, including tooling, best practices, and a future-proof architecture.

This issue does not implement business features (no FFmpeg logic yet).

It prepares the project so future issues can be implemented safely and incrementally by agents.

\---

\## Scope

\### In Scope

\- React Native project initialization (TypeScript)

\- Tooling and quality baseline

\- Code structure and architectural boundaries

\- Local-only (client-only) architecture

\- Documentation of conventions

\### Out of Scope

\- FFmpeg integration

\- Video processing logic

\- UI features

\- Backend / server implementation

\- Publishing / store configuration

\---

\## Technology Decisions (Locked)

\- Platform: Android + iOS

\- Framework: React Native (Bare workflow)

\- Language: TypeScript

\- Architecture: Client-only (no server)

\- Testing:

\- Unit: Jest

\- E2E: Deferred (Detox or Maestro in future issue)

\- Native code: Kotlin (Android), Swift (iOS)

\---

\## Project Structure

/apps/mobile

/src

/app # App shell, navigation, providers

/features # Vertical slices (import, split, export, settings)

/domain # Pure business logic (no React, no native)

/services # Use-cases / orchestration

/adapters # Side effects (filesystem, native bridges)

/ui # Reusable UI components

/lib # Utilities, helpers

/config # Constants, env, feature flags

/\_\_tests\_\_

/native # Notes / placeholders for native modules

/packages

/shared # (optional, empty for now)

  

\### Architectural Rules

\- domain/ must be pure TypeScript

\- adapters/ isolate all IO and native access

\- features/ own screens and feature logic

\- UI must not access native APIs directly

\---

\## Tooling & Best Practices

\### TypeScript

\- Strict mode enabled

\- No any allowed without justification

\### Linting & Formatting

\- ESLint (TypeScript + React + React Native)

\- Prettier

\- ESLint and Prettier integrated

\### Spelling

\- CSpell for code and markdown

\- Custom dictionary for technical terms

\### Git Hooks

\- Husky

\- lint-staged

\- Pre-commit checks:

\- eslint

\- prettier

\- cspell

\### Tests

\- Jest configured for React Native

\- One sample unit test included

\### Code Quality

\- EditorConfig

\- Conventional Commits (documented)

\---

\## Scripts

Provide scripts for:

\- lint

\- lint:fix

\- format

\- format:check

\- test

\- test:watch

\- spellcheck

\---

\## Documentation

Add:

\- [](http://README.md)[README.md](http://README.md)

\- docs/[](http://architecture.md)[architecture.md](http://architecture.md)

\- docs/[](http://contributing.md)[contributing.md](http://contributing.md)

\---

\## Definition of Done

\- App builds on Android and iOS

\- Linting, formatting, spellcheck pass

\- Tests run successfully

\- Folder structure exists

\- No feature logic implemented

\- Documentation added

\- No unresolved TODOs

\---

\## Follow-Up Issues

\- Native FFmpeg adapter (Android)

\- Native FFmpeg adapter (iOS)

\- Video import feature

\- Frame extraction domain logic

\- Export and share pipeline

\- E2E testing setup

\---

\## Notes for Agents

\- Keep initialization minimal

\- Do not add feature logic

\- Prefer clarity over cleverness

\- Prepare for future issues
