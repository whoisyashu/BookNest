# Render Deployment Guide for BookNest Backend

## Prerequisites

1. A GitHub account with your code repository
2. A Render account (free at render.com)
3. A MongoDB Atlas account for production database

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your latest code is pushed to a GitHub repository.

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the BookNest repository

### 3. Configure Your Service

- **Name**: `booknest-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Set Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_REFRESH_EXPIRE=30d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
```

### 5. Deploy

Click "Create Web Service" and Render will automatically deploy your application.

## Important Notes

### MongoDB Setup
- Use MongoDB Atlas for production
- Update the `MONGODB_URI` with your Atlas connection string
- Ensure your Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Render's IP ranges

### Security
- Generate new, secure JWT secrets for production
- Use environment variables for all sensitive data
- Never commit `.env` files to GitHub

### CORS Configuration
- Update `FRONTEND_URL` environment variable with your frontend domain
- The backend automatically configures CORS based on NODE_ENV

### File Uploads
- Render has ephemeral storage
- Consider using cloud storage (AWS S3, Cloudinary) for file uploads in production

### Monitoring
- Render provides logs and metrics in the dashboard
- Set up health checks using the `/health` endpoint

## Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version compatibility
2. **Database Connection**: Verify MongoDB URI and network access
3. **Environment Variables**: Ensure all required variables are set
4. **CORS Errors**: Check FRONTEND_URL configuration

### Health Check

Your API will be available at: `https://your-service-name.onrender.com`

Test with: `https://your-service-name.onrender.com/health`

## Post-Deployment

1. Test all API endpoints
2. Update your frontend to use the new backend URL
3. Set up monitoring and alerting
4. Consider upgrading to a paid plan for better performance

## Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- Limited compute resources
- Consider upgrading for production use
