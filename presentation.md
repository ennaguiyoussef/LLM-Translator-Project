# LLM-Translator-Project (English ↔ Moroccan Darija)

## Slide 1 — Title & Context
- **Project:** LLM-Translator-Project
- **Focus:** English ↔ Moroccan Darija translation
- **Audience:** Master-level AI/NLP students
- **Scope:** Backend API, web client, browser extension

## Slide 2 — Motivation & Problem Statement
- Darija is a widely spoken Moroccan dialect with limited digital resources
- Existing MT systems underperform on dialectal Arabic varieties
- Goal: enable practical, everyday translation between English and Darija
- Need for an accessible, user-facing translator powered by LLMs

## Slide 3 — Project Objectives
- Build a translation service using Large Language Models (LLMs)
- Provide multiple user interfaces (web client + browser extension)
- Keep the pipeline lightweight and easy to deploy locally
- Improve accessibility for non-technical end users

## Slide 4 — System Architecture (High-Level)
- **Backend API:** Java (JAX-RS) service that calls an LLM
- **Web Client:** PHP + HTML/CSS/JS interface for translation
- **Browser Extension:** Chrome MV3 popup + content scripts
- Components communicate over HTTP (client/extension → API)

## Slide 5 — Backend Translator Service
- Java service hosted with Grizzly HTTP server
- REST endpoint: `POST /api/translator/translate`
- Validates input and forwards it to the LLM client
- Returns translated Darija text as plain text

## Slide 6 — LLM Role in Translation
- LLM handles semantic mapping and dialectal phrasing
- Prompting instructs translation **only** in Darija (Arabic script)
- Uses Groq API for chat completions (LLM inference)
- Enables rapid experimentation without custom model training

## Slide 7 — Technologies Used
- **Backend:** Java 17, JAX-RS (Jersey), Grizzly
- **LLM Access:** Groq API (chat completions)
- **Web Client:** PHP, HTML, CSS, JavaScript
- **Extension:** Chrome MV3 (background, popup, content script)

## Slide 8 — Translation Workflow (Pipeline)
1. User submits English text from web UI or extension
2. Client sends POST request to backend API
3. Backend formats prompt and calls the LLM API
4. LLM returns Darija translation
5. API responds; UI displays translation and stores history

## Slide 9 — Demo: User Interaction Flow
- User enters English text in the web client or extension popup
- Clicks **Translate** (or uses Ctrl+Enter)
- Receives Darija output with copy-to-clipboard option
- Recent translations saved locally for quick reuse

## Slide 10 — Challenges (Darija-Specific)
- Dialectal variability and informal spelling
- Lack of large, clean parallel corpora
- Ambiguity in English-to-Darija mapping
- Balancing fidelity vs. naturalness for end users

## Slide 11 — Results & Benefits
- End-to-end translator with real-time responses
- Multiple access points (web + extension)
- Improves accessibility for Darija speakers/learners
- Demonstrates practical LLM usage in low-resource settings

## Slide 12 — Limitations
- Reliance on external LLM API (latency/cost)
- Hardcoded API configuration not production-ready
- Quality depends on prompt and model availability
- No automatic evaluation metrics integrated yet

## Slide 13 — Future Improvements
- Add evaluation benchmarks and human feedback loop
- Improve prompt engineering and context handling
- Expand language direction (Darija → English) UI toggle
- Add caching, auth, and secure secrets management

## Slide 14 — Conclusion
- LLMs enable rapid, practical translation for low-resource dialects
- System architecture cleanly separates backend and clients
- Project is a strong base for research + product evolution
- Next steps: evaluation, robustness, and production hardening
