# ⏱️ RATE LIMIT - This is Normal!

**Message:** "Too many requests. Please wait a moment before trying again."  
**Status:** ✅ This is a **safety feature** working correctly  
**What to do:** Wait 1 minute and try again

---

## 🎯 What's Happening

You've hit ONE of these rate limits:

### 1. **App Session Limit** (Most Likely)
- **Limit:** 15 AI calls per session
- **Purpose:** Protects your API quota
- **How to fix:** Click the "Retry" button or refresh the page

### 2. **Google API Rate Limit**
- **Limit:** ~60 requests per minute (free tier)
- **Purpose:** Google's standard rate limiting
- **How to fix:** Wait 1 minute

### 3. **Daily Quota**
- **Limit:** 1500 requests per day (free tier)
- **Purpose:** Google's daily quota
- **How to fix:** Wait until tomorrow or upgrade

---

## ✅ QUICK FIX (Choose One)

### Option 1: Reset Session (Instant)
Click the **"Retry"** button on the error message. This resets the session counter.

### Option 2: Refresh Page (Instant)
Just refresh the browser page (F5 or Ctrl+R). This also resets the session.

### Option 3: Wait 1 Minute
If it's Google's rate limit, wait 60 seconds and try again.

---

## 🔍 Which Rate Limit Is It?

### **App Session Limit** (if you see this):
- You've analyzed ~3-5 texts in a row
- Each analysis uses 3-5 API calls
- 15 calls = about 3-5 analyses
- **Fix:** Refresh the page!

### **Google API Limit** (if you see this):
- You're making requests too fast
- **Fix:** Wait 60 seconds

### **Daily Quota** (unlikely for testing):
- You've made 1500+ requests today
- **Fix:** Wait until tomorrow

---

## 📊 How Many AI Calls Does Each Analysis Use?

A typical analysis uses **3-5 API calls:**

1. **Extract claims:** 1 call (Gemini Flash)
2. **Verify each claim:** 1 call per claim (Gemini Pro)
   - Example: 3 claims = 3 calls
3. **Consistency check:** 1 call (Gemini Flash)
4. **Risk analysis:** 1 call (Gemini Flash)

**Total:** If you extract 3 claims = ~6 API calls

**Session limit:** 15 calls = ~2-3 full analyses

---

## ⚡ IMMEDIATE SOLUTION

### **Right Now - Do This:**

1. **Click the "Retry" button** on the error
2. **OR refresh your browser** (F5 or Ctrl+R)
3. **Wait 5 seconds**
4. **Try again** with your text

This resets the session counter and you can continue!

---

## 🔧 IF YOU WANT TO INCREASE THE LIMIT

The session limit is set in `utils/scheduler.ts`:

```typescript
const MAX_AI_CALLS_PER_SESSION = 15;
```

You can increase this, but be careful:
- ⚠️ Free tier has daily limits
- ⚠️ Upgrading to paid can cost money
- ✅ 15 is a safe default for testing

To change it:
1. Open `d:\proofpilot\utils\scheduler.ts`
2. Change line 4: `const MAX_AI_CALLS_PER_SESSION = 30;` (or higher)
3. Save and refresh browser

---

## 📈 GOOGLE API FREE TIER LIMITS

Standard free limits:
- **Per minute:** ~60 requests
- **Per day:** 1,500 requests  
- **Per project:** Shared across all users

For a hackathon demo, these limits are **more than enough**!

---

## ✅ THIS IS ACTUALLY GOOD NEWS!

The fact that you're seeing rate limits means:

1. ✅ **API is working!** (You're making successful calls)
2. ✅ **Safety features work!** (Protecting your quota)
3. ✅ **App is functional!** (It's analyzing text correctly)

You just need to reset the session between analyses.

---

## 🎯 BEST PRACTICES FOR DEMO

### For Your Hackathon Demo:

1. **Refresh between tests** - Resets the session counter
2. **Prepare 3-4 samples** - Don't test endlessly
3. **Wait between requests** - Give it 5-10 seconds
4. **Use shorter texts** - Fewer claims = fewer API calls

### Good Demo Flow:
1. Show fake news (1 analysis, wait 10 sec)
2. Show real news (2 analyses, wait 10 sec)
3. Show mixed content (3 analyses, wait 10 sec)
4. Show security lab (4 analyses)
5. **Total:** ~15 calls - just under the limit! ✅

---

## 📋 QUICK REFERENCE

| Limit Type | Value | Fix |
|------------|-------|-----|
| Session Calls | 15 | Refresh page |
| Per Minute | ~60 | Wait 1 min |
| Per Day | 1,500 | Wait 24 hours |

---

## 🎉 SUMMARY

**What happened:** You hit the 15-call session limit (safety feature)  
**Why it's good:** Your app is working! API calls succeeded!  
**What to do:** Click "Retry" or refresh the page  
**How long:** Instant fix!

---

**This is NORMAL and EXPECTED for a well-protected app!** 🛡️

Just refresh the page and you can continue testing! 🚀
