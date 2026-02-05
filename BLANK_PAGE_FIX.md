# 🚨 BLANK PAGE FIX - Action Required

**Issue:** https://proofpilot.onrender.com/ shows a blank page  
**Cause:** API key not set during build, causing JavaScript crash  
**Fix Time:** 10 minutes  

---

## 🔴 ROOT CAUSE

Your Vite app embeds environment variables at **BUILD TIME**, not runtime.

### What Happened:
1. ❌ Render built the app **without** `GEMINI_API_KEY` set
2. ❌ Vite embedded `undefined` into the JavaScript bundle
3. ❌ When the app loads, this line crashes:
   ```typescript
   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
   // process.env.API_KEY is undefined!
   ```
4. ❌ JavaScript error → Blank white page

---

## ✅ SOLUTION: Set API Key & Rebuild

### Step 1: Set Environment Variable on Render (5 min)

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com

2. **Select Your Service**
   - Find `proofpilot` in your services list
   - Click on it

3. **Add Environment Variable**
   - Click "Environment" in the left sidebar
   - Click "Add Environment Variable"
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your actual Gemini API key from Google AI Studio
   - Click "Save Changes"

4. **Get Your API Key** (if you don't have it)
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google
   - Click "Get API Key" or "Create API Key"
   - Copy the key

### Step 2: Trigger Rebuild (1 min)

After saving the environment variable, Render might auto-rebuild. If not:

1. Click "Manual Deploy" button (top right)
2. Select "Deploy latest commit"
3. Wait 3-5 minutes for build to complete

---

## 🔍 HOW TO VERIFY IT WORKED

### Check Build Logs:
1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Look for:
   ```
   ✓ built in XXXXms
   Build complete
   ```

### Check Deployment:
1. Wait for "Live" status (green)
2. Visit https://proofpilot.onrender.com/
3. Page should now show the ProofPilot interface (not blank!)

---

## 📋 Quick Troubleshooting

### If Still Blank After Rebuild:

**Check Browser Console:**
1. Open https://proofpilot.onrender.com/
2. Press F12 or right-click → Inspect
3. Click "Console" tab
4. Look for red errors
5. Share the error message with me

**Check Build Logs:**
1. Render Dashboard → Logs
2. Look for any build errors
3. Should see "build completed" message

---

## 🎯 WHY THIS HAPPENED

### Vite Environment Variable Behavior:
- Vite uses `define` to replace `process.env.X` at **build time**
- This is different from Node.js apps that read env vars at runtime
- If the env var isn't set during build, it embeds `undefined`

### Your Current Config:
```typescript
// vite.config.ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  // ↑ This happens at BUILD time, not RUNTIME
}
```

---

## ⚡ ALTERNATIVE: Quick Local Fix (If Render is Slow)

If you want to test immediately without waiting for Render:

```bash
# 1. Set API key locally
echo "GEMINI_API_KEY=your_actual_key_here" > .env.local

# 2. Build with the key
npm run build

# 3. Test locally
npm run preview
# Visit http://localhost:4173

# 4. If it works, you know the fix is correct
```

---

## 📊 Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Set env var on Render | 2 min | ⏳ Pending |
| Trigger manual deploy | 1 min | ⏳ Pending |
| Wait for build | 3-5 min | ⏳ Pending |
| App goes live | Instant | ⏳ Pending |
| **Total** | **~8 minutes** | |

---

## ✅ CHECKLIST

- [ ] Get Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Go to Render Dashboard (https://dashboard.render.com)
- [ ] Select `proofpilot` service
- [ ] Click "Environment" tab
- [ ] Add `GEMINI_API_KEY` environment variable
- [ ] Save changes
- [ ] Click "Manual Deploy" if no auto-deploy
- [ ] Wait for build to complete (~3-5 min)
- [ ] Visit https://proofpilot.onrender.com/
- [ ] Verify app loads (not blank!)
- [ ] Test with sample text

---

## 🆘 IF YOU NEED HELP

### Can't Find API Key?
- Create one at: https://aistudio.google.com/app/apikey
- It's free for development/testing

### Can't Access Render Dashboard?
- Check your email for Render login link
- Reset password if needed

### Build Still Failing?
- Share the build logs from Render
- I can help debug specific errors

### App Still Blank After Fix?
- Open browser console (F12)
- Share any JavaScript errors
- We'll debug further

---

## 📝 TECHNICAL NOTES

### Why Not Use Runtime Env Vars?

For a static site on Render, you can't use runtime environment variables because:
1. Static sites are pre-built HTML/JS/CSS
2. No server to inject env vars at request time
3. All env vars must be embedded at build time

### Better Approach for Production:

For a real production app, you'd want:
1. **Backend Proxy** - Never expose API keys to client
2. **Serverless Functions** - Handle API calls server-side
3. **Edge Functions** - Cloudflare Workers, Vercel Edge

But for a hackathon demo, embedding at build time is acceptable with:
- API quotas set on Google Cloud Console
- Request rate limiting in the app (which you have!)

---

## 🎯 AFTER IT'S FIXED

Once the app is live:
1. Test all 3 sample texts from `JUDGE_GUIDE.md`
2. Verify claim extraction works
3. Check that sources appear
4. Test the security lab
5. You're ready to demo! 🎉

---

**Generated:** February 5, 2026, 3:41 PM  
**Priority:** 🔴 CRITICAL FIX  
**Time to Fix:** ~10 minutes  
**Next Step:** Set `GEMINI_API_KEY` on Render Dashboard

---

🚀 **Once you set the API key and rebuild, your app will work perfectly!**
