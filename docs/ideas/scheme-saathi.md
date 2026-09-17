# SchemeSaathi

## Problem Statement
How might we bridge the massive "awareness and application gap" for Indian welfare schemes by building an AI agent that discovers eligibility and automates the preparation of bureaucratic paperwork for citizens?

## Recommended Direction
A responsive web application designed for desktop/laptop use. The user interacts with a conversational AI chat interface in plain text. The AI extracts demographic and financial data, uses RAG against myScheme open data to find eligible schemes, and acts as a "Smart Preparation Engine." Since public submission APIs don't exist, the tool will auto-generate perfectly pre-filled PDF application forms (simulating data pulled from DigiLocker) and provide a step-by-step submission checklist.

## Key Assumptions to Validate
- [ ] **Data Mapping:** We assume myScheme's metadata is structured cleanly enough for an LLM to accurately perform logical checks (e.g., matching "I am a widow" to "marital_status: widowed").
- [ ] **PDF Generation:** We can map the LLM's structured JSON output to the exact fields of a standardized government PDF form.
- [ ] **User Patience:** We assume users will be willing to answer 5-10 conversational questions to get their pre-filled forms.

## MVP Scope
**In Scope:**
- A Next.js or React-based web dashboard.
- A text-based LLM chat interface that dynamically asks questions to narrow down eligibility.
- A RAG backend loaded with data from 10-20 high-impact schemes (scraped/exported from myScheme).
- A "Document Generator" that takes the chat data (and simulated DigiLocker data) to generate a downloadable, pre-filled PDF form.
- A customized "Action Plan" indicating exactly where to submit the PDF (online URL or local Common Service Centre).

## Not Doing (and Why)
- **Voice/Mobile App:** (Why: Too much overhead for the initial MVP prototype; we want to nail the core logic on a web interface first).
- **Real Application Submission/API Integration:** (Why: Government portals do not have open APIs for third-party submission. Generating the required documents bridges 90% of the friction).
- **Real DigiLocker OAuth:** (Why: Requires strict regulatory approvals. We will use a mock "Connect DigiLocker" flow that injects dummy verified data).

## Open Questions
- To make the PDF generation look authentic, we will need to find and download a few real blank PDF forms for the schemes we select for the MVP.
