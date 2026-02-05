# ⚡ HOW TO FIX: Results Not Showing

## THE PROBLEM
Your `.env.local` has `PLACEHOLDER_API_KEY` instead of a real Gemini API key.

## THE FIX (2 Steps)

### Step 1: Get Real API Key (2 minutes)
1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click "Get API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Update .env.local (1 minute)
Replace the contents of `.env.local` with:
```
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
```
(Paste your real key, not the example above!)

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C in the terminal)
# Then run:
npm run dev
```

### Step 4: Test
1. Visit http://localhost:3000
2. Paste this text:
   ```
   The Earth orbits around the Sun.
   ```
3. Click "Start Forensic Audit"
4. **Results should now appear!** ✅

---

## FOR RENDER (Production)
1. Go to: https://dashboard.render.com
2. Select `proofpilot` service
3. Click "Environment" → "Add Environment Variable"
4. Add `GEMINI_API_KEY` = your real API key
5. Click "Manual Deploy"
6. Wait 3-5 min
7. Test at https://proofpilot.onrender.com

---

**That's it!** Once you have a real API key, everything will work perfectly! 🚀

Full details in: `RESULTS_NOT_SHOWING_FIX.md`
