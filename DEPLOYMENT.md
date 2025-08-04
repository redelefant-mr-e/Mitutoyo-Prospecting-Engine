# Deployment Guide

This guide covers various ways to deploy the Clay CSV Viewer as a standalone application.

## 🚀 Quick Deploy Options

### 1. GitHub Pages (Free)

1. **Fork or clone the repository**
2. **Update package.json** with your GitHub username:
   ```json
   {
     "homepage": "https://yourusername.github.io/clay-csv-viewer",
     "repository": {
       "url": "https://github.com/yourusername/clay-csv-viewer.git"
     }
   }
   ```
3. **Install dependencies and deploy**:
   ```bash
   npm install
   npm run deploy
   ```
4. **Enable GitHub Pages** in your repository settings (Settings > Pages)

### 2. Netlify (Free)

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Drag the `dist/` folder** to [Netlify Drop](https://app.netlify.com/drop)
3. **Or connect your GitHub repository** to Netlify for automatic deployments

### 3. Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

## 🖥️ Desktop Application

### Using Electron

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run as desktop app**:
   ```bash
   # Development mode
   npm run electron-dev
   
   # Production build
   npm run electron-build
   ```

3. **Package for distribution**:
   ```bash
   npm run package
   ```

### Using Tauri (Alternative to Electron)

1. **Install Tauri CLI**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

2. **Initialize Tauri**:
   ```bash
   tauri init
   ```

3. **Build and run**:
   ```bash
   tauri dev
   tauri build
   ```

## 🐳 Docker Deployment

### Option 1: Nginx Container

1. **Create Dockerfile**:
   ```dockerfile
   FROM nginx:alpine
   COPY dist/ /usr/share/nginx/html/
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run**:
   ```bash
   npm run build
   docker build -t clay-csv-viewer .
   docker run -p 80:80 clay-csv-viewer
   ```

### Option 2: Multi-stage Build

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ☁️ Cloud Deployment

### AWS S3 + CloudFront

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

3. **Configure CloudFront** for CDN and HTTPS

### Google Cloud Storage

1. **Build and upload**:
   ```bash
   npm run build
   gsutil -m cp -r dist/* gs://your-bucket-name/
   ```

2. **Make bucket public** and configure CORS

### Azure Static Web Apps

1. **Connect your GitHub repository** to Azure Static Web Apps
2. **Configure build settings**:
   - Build command: `npm run build`
   - Output location: `dist`

## 🔧 Environment Configuration

### For Production

Create a `.env.production` file:
```env
VITE_APP_TITLE=Clay CSV Viewer
VITE_APP_VERSION=1.0.0
```

### For Development

Create a `.env.development` file:
```env
VITE_APP_TITLE=Clay CSV Viewer (Dev)
VITE_APP_VERSION=1.0.0
```

## 📱 Progressive Web App (PWA)

To make it a PWA, add to `public/manifest.json`:

```json
{
  "name": "Clay CSV Viewer",
  "short_name": "CSV Viewer",
  "description": "Modern CSV viewer with JSON support",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff7ed",
  "theme_color": "#ff4800",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔒 Security Considerations

1. **Content Security Policy**: Add CSP headers for production
2. **HTTPS**: Always use HTTPS in production
3. **File Upload Limits**: Consider adding file size limits
4. **CORS**: Configure CORS if needed for API calls

## 📊 Performance Optimization

1. **Enable Gzip compression** on your web server
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Optimize images** and assets

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (16+ required)
2. **Electron won't start**: Ensure `dist/` folder exists
3. **Deployment fails**: Check file permissions and paths
4. **CORS errors**: Configure your server's CORS settings

### Debug Commands

```bash
# Check build output
npm run build && ls -la dist/

# Test production build locally
npm run preview

# Debug Electron
DEBUG=electron* npm run electron-dev
```

## 📞 Support

For deployment issues:
1. Check the [GitHub Issues](https://github.com/yourusername/clay-csv-viewer/issues)
2. Review the [README.md](./README.md) for basic setup
3. Ensure all dependencies are installed correctly

---

**Happy Deploying! 🚀** 