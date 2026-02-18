# Deployment Guide

## 🚀 Deploy to GitHub & Vercel

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `sudha-nepali-pos`
3. Don't initialize with README (we already have one)
4. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# Navigate to project directory
cd pos-system-enhancements

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Sudha Nepali POS System with restaurant features"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sudha-nepali-pos.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
7. Your app will be live at `https://your-project.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? sudha-nepali-pos
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## 🔧 Environment Variables

For production deployment, you may want to add:

```env
# Add in Vercel Dashboard → Settings → Environment Variables

# Database (when you integrate)
DATABASE_URL=your_database_url

# Authentication (when you add)
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com

# Payment Gateway (optional)
STRIPE_SECRET_KEY=your_stripe_key
```

## 📊 Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test login with demo credentials
- [ ] Test POS functionality
- [ ] Test restaurant table mode
- [ ] Test recipe management
- [ ] Verify mobile responsiveness
- [ ] Check language switching (EN/NE)
- [ ] Test role-based access control

## 🐛 Troubleshooting

### Build Fails
- Check `package.json` for missing dependencies
- Run `npm install` locally
- Check for TypeScript errors: `npm run build`

### Pages Not Loading
- Check browser console for errors
- Verify all imports are correct
- Clear browser cache

### Vercel Deployment Issues
- Check build logs in Vercel dashboard
- Ensure Node.js version is 18+
- Verify all environment variables are set

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch auto-deploys to production
- Pull requests create preview deployments
- Rollback available in Vercel dashboard

## 📈 Monitoring

Vercel provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Deployment logs

Access at: `https://vercel.com/your-username/sudha-nepali-pos`

## 🎉 Success!

Your POS system is now live and accessible worldwide!

Share your deployment URL:
`https://sudha-nepali-pos.vercel.app`
