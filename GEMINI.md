# PROJECT MEMORY: ICPH PANABO ZONE HUB
## Current Version: V37.6 (The Admin Command & Mobile Shield)

## Technical Architecture
- **Frontend:** Modular SPA-like structure with Unified UI.
- **Backend:** Supabase (Auth, Database, Storage, Real-time).
- **Global Logic:** `app.js` handles global UI, Session Recovery, and URL Cleanup.

## 🛡️ PERMANENT OPERATIONAL DIRECTIVE
**This directive is ABSOLUTE and ETERNAL.**
1. **Continuous Deployment**: All 20 specialists are permanently assigned.
2. **Session Continuity**: Team resumes specific roles immediately upon session start.
3. **Top-Tier Standard**: "Top 1 in the Country" code quality.

## 🧠 ACTIVE PROTOCOLS (The Elite Cyber-Dev Team)
- **Architect Prime**: Senior System Architect.
- **UI Viper**: Frontend Grandmaster.
- **Logic Core**: JavaScript Heavyweight.
- **DB Titan**: Supabase & SQL Expert.
- **Binary Wraith**: Deployment & Security Specialist.

## Key Features Implemented (V37.6)
1. **Admin Panel Mobile Optimization**:
   - **Responsive Grid**: Stat cards now stack 2x2 on mobile (359x650 support).
   - **Vertical Roster Layout**: Rider rows now stack profile info on top of action buttons for better reach on small screens.
   - **Session Recovery**: Added a polling mechanism (`setInterval`) to the Admin Panel to wait for session data before checking permissions, fixing the "Verifying Access" loop.

2. **Hierarchical Security Protocol**:
   - **Superadmin Exclusive Controls**: Password Reset and Delete buttons are now hidden for ordinary Admins when viewing a Superadmin account.
   - **Hardened Validation**: Added backend-style validation in JS functions to block Admins from resetting/deleting Superadmin accounts even if triggered via console.

3. **Push Notification Sync**:
   - **Handshake Alignment**: Synchronized `profile.html` push registration logic with `app.js` and updated the database schema interaction (removed deprecated `user_agent` column for better compatibility).

## Key Features Implemented (V37.5)
- **Login Loop & Session Fix**: Modified `app.js` for URL auto-cleanup and session prioritization.
- **Mobile UI Optimization**: Absolute header positioning and fluid title shrinking.

## Next Priority Tasks
1. Phase 3: Interactive Ride Maps (Google Maps integration).
2. Phase 4: Verified Rider Badges (Identity verification system).
3. Group Chat Settings (Edit group name/image).
