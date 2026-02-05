# 🔧 FIX: Results Not Showing (Blank Output)

**Issue:** When you paste text and click "Start Forensic Audit", nothing happens - no results appear  
**Root Cause:** Invalid API key (`PLACEHOLDER_API_KEY`)  
**Fix Time:** 5 minutes

---

## 🚨 PROBLEM DIAGNOSIS

You're experiencing this behavior:
1. ✅ App loads successfully
2. ✅ Can paste text into the input field
3. ✅ "Start Forensic Audit" button works
4. ⏳ Loading spinner appears
5. ❌ **Results never show** - stays stuck on loading OR shows nothing

### Why This Happens:

Your `.env.local` file contains:
```
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

When the app tries to call Gemini API with this fake key:
- ❌ API returns 401 Unauthorized error
- ❌ Error might not be displayed properly
- ❌ App gets stuck or shows nothing

---

## ✅ SOLUTION: Set Real API Key

### Option 1: Fix Locally (Test Before Deployment)

1. **Get Your Real Gemini API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Get API Key" or "Create API Key"
   - Copy the key (format: `AIza...`)

2. **Update .env.local**
   ```bash
   # Open .env.local and replace with your real key
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Restart Dev Server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Test the App**
   - Visit http://localhost:3000
   - Paste sample text (from JUDGE_GUIDE.md)
   - Click "Start Forensic Audit"
   - Results should now appear!

### Option 2: Fix on Render (Production)

This is what you MUST do for the deployed app to work:

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com

2. **Select Your Service**
   - Find `proofpilot`
   - Click on it

3. **Set Environment Variable**
   - Click "Environment" tab
   - Click "Add Environment Variable"
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your real API key (`AIza...`)
   - Click "Save Changes"

4. **Trigger Rebuild** (IMPORTANT!)
   - Click "Manual Deploy"
   - Select "Deploy latest commit"
   - Wait 3-5 minutes

5. **Test Production**
   - Visit https://proofpilot.onrender.com
   - Try analyzing text
   - Results should now work!

---

## 🧪 TESTING STEPS

### After Setting Real API Key:

1. **Test with Simple Text**
   ```
   The Earth orbits around the Sun.
   ```
   **Expected:** Should extract claim and verify as TRUE

2. **Test with Fake News**
   ```
   Scientists discovered drinking 10 glasses of water daily 
   can reverse aging by 20 years within 30 days.
   ```
   **Expected:** Should show FALSE verdict

3. **Test with Real News**
   ```
   James Webb Space Telescope was launched in December 2021 
   and is located at the L2 point, 1.5 million km from Earth.
   ```
   **Expected:** Should show TRUE verdicts with sources

---

## 🔍 HOW TO DEBUG IF STILL NOT WORKING

### Check Browser Console:

1. Open the app (http://localhost:3000 or your Render URL)
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for red errors

#### Common Errors You Might See:

**Error 1: API Key Invalid**
```
Error: [400] API key not valid
```
**Fix:** Double-check your API key is correct

**Error 2: Quota Exceeded**
```
Resource has been exhausted
```
**Fix:** Wait 24 hours or upgrade API quota

**Error 3: Network Error**
```
Failed to fetch
```
**Fix:** Check your internet connection

**Error 4: CORS Error**
```
CORS policy blocked
```
**Fix:** This shouldn't happen with Gemini API, contact me if you see this

---

## 📊 VERIFICATION CHECKLIST

After applying the fix:

- [ ] **Local Testing:**
  - [ ] .env.local has real API key
  - [ ] Dev server restarted
  - [ ] Can paste text
  - [ ] Click "Start Forensic Audit"
  - [ ] Loading spinner appears
  - [ ] Claims extract successfully
  - [ ] Verdicts show (True/False/Unverified)
  - [ ] Sources appear (with links)
  - [ ] Can expand claim cards
  - [ ] No errors in console

- [ ] **Production Testing (Render):**
  - [ ] GEMINI_API_KEY set in Environment
  - [ ] Manual deploy triggered
  - [ ] Build completed successfully
  - [ ] App is "Live" (green status)
  - [ ] Visit https://proofpilot.onrender.com
  - [ ] Can analyze text
  - [ ] Results appear correctly
  - [ ] No blank pages
  - [ ] No errors in console

---

## ⚡ QUICK FIX COMMANDS

```bash
# 1. Open .env.local in your editor
code .env.local
# OR
notepad .env.local

# 2. Replace PLACEHOLDER_API_KEY with your real key
# Save the file

# 3. Restart dev server
# Press Ctrl+C to stop current server
npm run dev

# 4. Test in browser
# Visit http://localhost:3000
# Paste text and click "Start Forensic Audit"
```

---

## 🎯 EXPECTED BEHAVIOR (After Fix)

### When You Paste Text:

1. **Input Validation** ✅
   - If text too short: Error message
   - If text too long: Error message
   - If just right: Continues

2. **Extraction Phase** ✅
   - Status changes to "extracting"
   - Loading spinner shows
   - Claims extracted (2-3 seconds)

3. **Verification Phase** ✅
   - Status changes to "verifying"
   - "Auditing Digital Fingerprints..." message
   - Each claim verified (3-5 seconds per claim)

4. **Results Display** ✅
   - Claim cards appear
   - Verdicts shown (colored badges)
   - Confidence scores displayed
   - Can expand for details
   - Sources shown with links

---

## 🆘 STILL NOT WORKING?

### If Local Testing Fails:

**Check 1: Is the API key correct?**
```bash
# Your key should start with "AIza" and be ~39 characters
# Example: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Check 2: Did you restart the dev server?**
```bash
# You MUST restart after changing .env.local
# Ctrl+C to stop
# npm run dev to restart
```

**Check 3: Check browser console**
- F12 → Console tab
- Share any red errors with me

### If Production (Render) Fails:

**Check 1: Did you trigger a rebuild?**
- Setting the env var alone isn't enough
- You MUST click "Manual Deploy"
- Wait for build to complete

**Check 2: Check Render logs**
- Dashboard → Your Service → Logs
- Look for build errors
- Should see "build completed successfully"

**Check 3: Is the env var actually set?**
- Dashboard → Environment tab
- Verify GEMINI_API_KEY is listed
- Verify the value is your real key (not PLACEHOLDER)

---

## 📝 IMPORTANT NOTES

### Why PLACEHOLDER_API_KEY Doesn't Work:

- It's literally the text "PLACEHOLDER_API_KEY"
- Google's API server sees this and returns 401 Unauthorized
- Your app can't verify claims without a valid key

### Where to Get Free API Key:

- Visit: https://aistudio.google.com/app/apikey
- **It's FREE** for development/testing
- Generous quotas for hackathon use
- No credit card required

### Security Reminder:

⚠️ **Never commit your real API key to GitHub!**
- The `.env.local` file is in `.gitignore` (safe)
- Don't hardcode it in source files
- For Render, use Environment Variables (secure)

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:

1. ✅ You paste text
2. ✅ Click "Start Forensic Audit"
3. ✅ See loading spinner
4. ✅ Claims appear in cards
5. ✅ Verdicts show (green/yellow/red badges)
6. ✅ Confidence percentages display
7. ✅ Can expand cards to see details
8. ✅ Sources show with clickable links
9. ✅ Audit log shows rule adjustments
10. ✅ No errors in console

---

## ⏱️ TIMELINE

| Step | Time | Status |
|------|------|--------|
| Get real API key | 2 min | ⏳ |
| Update .env.local | 1 min | ⏳ |
| Restart dev server | 30 sec | ⏳ |
| Test locally | 2 min | ⏳ |
| Set on Render | 2 min | ⏳ |
| Redeploy | 3-5 min | ⏳ |
| Test production | 2 min | ⏳ |
| **TOTAL** | **~15 min** | |

---

## 📞 NEXT STEPS

1. **Right now:** Get your real Gemini API key
2. **Then:** Update `.env.local` locally
3. **Test:** Run `npm run dev` and test the app
4. **Deploy:** Set API key on Render and rebuild
5. **Verify:** Test on https://proofpilot.onrender.com
6. **Demo:** You're ready! 🎉

---

**Generated:** February 5, 2026, 3:52 PM  
**Priority:** 🔴 CRITICAL  
**Fix Time:** ~15 minutes  
**Next Action:** Get real API key from https://aistudio.google.com/app/apikey

---

🚀 **Once you set the real API key, results will appear perfectly!**
