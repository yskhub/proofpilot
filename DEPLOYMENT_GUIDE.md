# 🚀 ProofPilot Deployment Guide

## Current Deployment Status

✅ **Code:** Pushed to GitHub  
✅ **Build:** Configured for Render  
⚠️ **Environment Variables:** REQUIRES MANUAL SETUP

---

## 🔴 CRITICAL: Set API Key on Render

Your application **will not work** until you complete this step:

### Step-by-Step Instructions

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in with your account

2. **Select Your Service**
   - Find `proofpilot` in your services list
   - Click on it to open the service details

3. **Navigate to Environment Tab**
   - Click "Environment" in the left sidebar
   - You should see environment variables section

4. **Add the API Key**
   - Click "Add Environment Variable"
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your actual Gemini API key from Google AI Studio
   - Click "Save Changes"

5. **Redeploy**
   - The service should automatically redeploy
   - If not, click "Manual Deploy" → "Deploy latest commit"

6. **Verify Deployment**
   - Wait for deployment to complete (2-5 minutes)
   - Visit your deployed URL: https://proofpilot.onrender.com
   - Try analyzing sample text

---

## 📋 Deployment Checklist

### Pre-Deployment
- [x] Code committed to GitHub
- [x] Build configuration in `render.yaml`
- [x] Dependencies in `package.json`
- [x] Build tested locally (`npm run build`)
- [ ] **GEMINI_API_KEY set in Render Dashboard** ⚠️

### Post-Deployment
- [ ] Application loads without errors
- [ ] Can submit text for analysis
- [ ] Claims are extracted correctly
- [ ] Verification produces results
- [ ] No console errors in browser DevTools
- [ ] Mobile responsive design works
- [ ] Share functionality works

---

## 🔑 Getting Your Gemini API Key

If you don't have a Gemini API key:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" (or "Create API Key")
4. Copy the generated key
5. Paste it into Render environment variables

**Security Note:** Never commit your API key to GitHub or share it publicly!

---

## 🐛 Troubleshooting

### Issue: "API Configuration Error"

**Cause:** Environment variable not set or incorrect

**Solution:**
1. Check Render Dashboard → Environment → `GEMINI_API_KEY` exists
2. Verify the key is valid (no typos)
3. Redeploy the service
4. Clear browser cache

### Issue: "Build Failed"

**Cause:** Missing dependencies or TypeScript errors

**Solution:**
1. Check build logs in Render dashboard
2. Run `npm run build` locally to reproduce error
3. Fix any TypeScript errors
4. Commit and push fixes

### Issue: "Application Doesn't Load"

**Cause:** Render configuration incorrect

**Solution:**
1. Verify `render.yaml` settings:
   - `staticPublishPath: dist`
   - `buildCommand: npm install --include=dev && npm run build`
2. Check Render logs for errors
3. Ensure `index.html` is in `dist/` folder after build

### Issue: "API Quota Exceeded"

**Cause:** Too many requests to Gemini API

**Solution:**
1. Check Google AI Studio usage dashboard
2. Wait for quota reset (usually daily)
3. Consider upgrading to paid tier
4. Implement client-side caching

### Issue: "Claims Not Verified"

**Cause:** Google Search grounding may fail

**Solution:**
1. Check if Gemini API supports Google Search in your region
2. Try again (transient failure)
3. Check API key permissions

---

## 📊 Monitoring Your Deployment

### Check Application Health

**URL:** https://proofpilot.onrender.com

**Expected Behavior:**
- Page loads within 3 seconds
- Can paste text into textarea
- "Start Forensic Audit" button enabled
- No console errors

### Check Render Logs

1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Look for:
   - ✅ "Build successful"
   - ✅ "Deploy live"
   - ❌ Any error messages

### Monitor API Usage

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Check "API Usage" or "Quotas"
3. Monitor requests per day
4. Set up billing alerts if using paid tier

---

## 🔄 Updating the Deployment

### Automatic Deployment (Recommended)

Render auto-deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Fix: improved error handling"
git push origin main

# Render automatically detects push and redeploys
```

### Manual Deployment

If auto-deploy is disabled:

1. Push code to GitHub
2. Go to Render Dashboard
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to "Custom Domain"
3. Add your domain (e.g., `proofpilot.com`)
4. Update DNS records as instructed by Render
5. Wait for SSL certificate (15-30 minutes)

---

## 💰 Cost Optimization

### Free Tier Limits (Current)

- **Render:** Free static site hosting
- **Gemini API:** Free tier with daily quotas

### Upgrade Considerations

**Upgrade Render if:**
- Need faster build times
- Want custom domains
- Require analytics

**Upgrade Gemini API if:**
- Hitting daily quotas
- Need higher rate limits
- Want priority support

---

## 📈 Analytics Setup (Optional)

Add Google Analytics for usage tracking:

1. Create GA4 property
2. Get measurement ID (G-XXXXXXXXXX)
3. Add to `index.html` before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

4. Commit and push

---

## 🎯 Production Readiness Checklist

### Security
- [ ] API key stored in environment variables (not code)
- [ ] HTTPS enabled (automatic with Render)
- [ ] Input validation implemented
- [ ] Rate limiting in place

### Performance
- [ ] Build optimized (`npm run build` completes)
- [ ] Assets minified
- [ ] Images optimized
- [ ] Fonts preloaded

### Monitoring
- [ ] Error tracking configured
- [ ] Analytics installed
- [ ] Performance monitoring
- [ ] Uptime monitoring

### Documentation
- [ ] README updated with live URL
- [ ] API key instructions clear
- [ ] Deployment guide complete
- [ ] Troubleshooting documented

---

## 🚨 Emergency Rollback

If deployment breaks production:

1. Go to Render Dashboard → Deploys
2. Find last working deployment
3. Click "..." → "Redeploy"
4. Service reverts to previous version

---

## 📞 Support Resources

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Status Page](https://status.render.com)

### Gemini API Support
- [Gemini API Docs](https://ai.google.dev/docs)
- [API Forum](https://discuss.ai.google.dev)
- [Issue Tracker](https://issuetracker.google.com/issues?q=componentid:1370848)

### ProofPilot Issues
- GitHub Issues: [Create Issue](https://github.com/yourusername/proofpilot/issues)
- Local Testing: `npm run dev`

---

## ✅ Final Verification

Run this checklist before demo/submission:

```
✓ Application loads at https://proofpilot.onrender.com
✓ Can paste text (try 2-3 paragraphs)
✓ "Start Forensic Audit" processes text
✓ Claims appear in UI
✓ Verdicts show (True/False/Unverified)
✓ Confidence scores display
✓ Expand claim to see details
✓ Sources are clickable
✓ Share functionality works
✓ Mobile view is responsive
✓ No console errors in DevTools
```

---

## 🎊 Deployment Complete!

Once you've:
1. ✅ Set `GEMINI_API_KEY` in Render
2. ✅ Verified application works
3. ✅ Tested key features

Your ProofPilot is **production-ready** and ready for demo!

**Live URL:** https://proofpilot.onrender.com

---

*Last Updated: February 5, 2026*  
*Questions? Check the Comprehensive Audit Report or create a GitHub issue.*
