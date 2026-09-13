# Project Master Plan & ICM Rules

## The Goal
The ultimate goal is to build digital businesses (starting with "Scents for Cents" and an Etsy automation workflow) to transition away from heavy physical labor and spend more time at home with family in West Cork.

## The Architecture (The Playbook)
1. **Frontend / UI:** Generate visual prototypes using **Lovable**.
2. **Version Control:** Push the code to **GitHub**.
3. **Local IDE:** Pull down to MacBook and run in **Google Antigravity** via **Node.js** (Localhost).
4. **Backend / Source of Truth:** Connect to **Supabase** (PostgreSQL) from Day 1 to store all data (users, searches, saved items) securely and for free.
5. **Hosting:** Deploy the live app using **Vercel** (Hobby plan).
6. **Automation:** Use cloud platforms (Modal, Make.com) or self-hosted n8n for background tasks that need to run while the MacBook is closed.

## The Methodology: ICM (Interpretable Context Methodology)
To prevent "context rot" and token limits, we strictly adhere to ICM:
- **Modular Folders:** Separate stages of the workflow into distinct folders.
- **Stage Contracts:** Each folder contains a `rules.md` or context file dictating exactly what the AI should do at that stage.
- **Lazy Loading:** Only load the specific skill or context file needed for the current task. Do not dump the entire project into the AI's prompt at once.
- **Skills as Modules:** Wrap repeatable tasks (like the Image Deconstructor) into standalone `SKILL.md` files.

## The Roadmap
### Phase 1: The Practice App (Turbine Fault Code Lookup)
- **Why:** Zero emotional attachment, low stakes, but identical architecture to Phase 2.
- **Function:** A simple search bar where a technician types a fault code and the app returns the description from Supabase.
- **Next Step:** Run `/grill-me on building the Turbine Fault Code app` to begin.

### Phase 2: The Dream App (Scents for Cents)
- **Why:** The core business idea.
- **Function:** Users search for a high-end perfume (e.g., Chanel No. 5) and the app returns affordable dupes from a Supabase database.
- **How:** Clone the finished Phase 1 app, rebrand the UI, and swap the database tables.

---
*Note: This file acts as our RAG "Brain". Antigravity can read this file anytime to instantly remember the entire plan without needing to read past chat history.*

## Progress Tracker
- [x] **Stage 1:** Visual Prototype (Search Bar & Conditional UI) Built and running on localhost.
- [x] **Stage 2:** Connect to Supabase for the database.
- [x] **Stage 3:** Push the repository to GitHub.
