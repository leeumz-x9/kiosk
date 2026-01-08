# 🚀 Deployment Guide

## Quick Deploy Steps

### 1. ✅ Git Push (Already Done!)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Repository**: https://github.com/leeumz-x9/kiosk.git

### 2. 🔥 Firebase Setup

#### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase --version
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize Project
```bash
firebase init

# Select:
✓ Hosting
✓ Firestore  
✓ Realtime Database

# Choose:
- Use existing project: kiosk-promax
- Public directory: dist
- Single-page app: Yes
- Overwrite index.html: No
```

### 3. 📦 Build for Production

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### 4. 🌐 Deploy to Firebase Hosting

```bash
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

Your app will be live at:
**https://kiosk-promax.web.app**

---

## Alternative Deployment Options

### Option 1: Vercel (Recommended for React)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://leeumz-x9.github.io/kiosk",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

---

## 🖥️ Local Development Setup

### Start Development Servers

**Terminal 1: Pi5 Camera Server**
```bash
cd pi5_server
python3 app_imx500.py
```

**Terminal 2: Vite Dev Server**
```bash
npm run dev
```

Access at: http://localhost:3000

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:
```bash
VITE_API_URL=https://your-pi5-server.com
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
```

### Pi5 Server Configuration

For production, update `src/config.js`:
```javascript
export const PI5_CONFIG = {
  endpoint: process.env.NODE_ENV === 'production' 
    ? 'https://your-pi5-server.com' 
    : 'http://172.20.10.2:5000'
};
```

---

## 📊 Firebase Configuration

See [FIREBASE_GUIDE.md](./FIREBASE_GUIDE.md) for detailed Firebase setup.

**Quick Firebase Config** (`src/config.js`):
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "kiosk-promax.firebaseapp.com",
  projectId: "kiosk-promax",
  storageBucket: "kiosk-promax.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  databaseURL: "https://kiosk-promax.firebaseio.com"
};
```

---

## 🎯 Production Checklist

- [ ] Build passes: `npm run build`
- [ ] No console errors
- [ ] Firebase config updated
- [ ] API endpoints configured for production
- [ ] Security rules set
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Monitoring enabled

---

## �� Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules/.vite dist
npm install
npm run build
```

### Firebase Deploy Issues
```bash
# Re-login
firebase logout
firebase login

# Check project
firebase projects:list
firebase use kiosk-promax
```

### Pi5 Server Not Accessible
- Ensure Pi5 server has public IP or use ngrok
- Update CORS settings in Flask
- Check firewall rules

---

## 📱 Testing Production Build Locally

```bash
# Build
npm run build

# Serve locally
npx vite preview

# Or use serve
npx serve dist
```

---

## 🎉 You're All Set!

Your kiosk app is now:
- ✅ Pushed to GitHub
- ✅ Ready for Firebase deploy
- ✅ Configured for production

**Next Steps:**
1. Run `firebase deploy`
2. Test at your Firebase URL
3. Configure custom domain (optional)
4. Set up monitoring

---

Made with ❤️ for Lanna Polytechnic College
