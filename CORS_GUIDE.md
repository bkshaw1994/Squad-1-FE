# CORS Configuration Guide

## Issue: "Failed to fetch" after deployment

If you're experiencing "Failed to fetch" errors after deployment, this is likely a **CORS (Cross-Origin Resource Sharing)** issue.

## Root Cause

The Azure backend (`https://my-mern-backend-ajeeasdqc6fphwgh.southindia-01.azurewebsites.net`) is not configured to allow requests from your deployed frontend domain.

## Backend CORS Configuration Required

### For Express.js Backend

Add the following CORS configuration to your backend:

```javascript
const cors = require('cors')

// For development
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local development
    'http://localhost:5173',           // Vite dev server
    'https://red-pebble-03589a91e.3.azurestaticapps.net', // Replace with your actual deployed domain
    'https://your-frontend.vercel.app', // If using Vercel
    'https://your-frontend.netlify.app' // If using Netlify
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}

app.use(cors(corsOptions))
```

### For Azure App Service

If using Azure App Service, you can also configure CORS in the Azure portal:

1. Go to your Azure App Service
2. Navigate to "CORS" in the left menu
3. Add your frontend domains to the "Allowed Origins" list
4. Make sure "Enable Access-Control-Allow-Credentials" is checked if using authentication

## Frontend Environment Variables

Make sure your `.env` file has the correct backend URL:

```env
VITE_API_BASE_URL=https://my-mern-backend-ajeeasdqc6fphwgh.southindia-01.azurewebsites.net
```

## Testing CORS Configuration

You can test if CORS is working by:

1. Opening browser developer tools
2. Going to the Network tab
3. Trying to login or access any API endpoint
4. Check if you see OPTIONS preflight requests succeeding

## Common CORS Issues

1. **Missing Origin**: Frontend domain not in allowed origins list
2. **Credentials**: If using `credentials: true`, ensure CORS allows credentials
3. **Headers**: Make sure all required headers are allowed
4. **HTTP Methods**: Ensure all used HTTP methods are allowed

## Temporary Workaround (Not Recommended for Production)

For testing purposes only, you can configure the backend to allow all origins:

```javascript
app.use(cors({
  origin: true, // Allow all origins - NOT SECURE for production
  credentials: true
}))
```

**⚠️ WARNING: Never use `origin: true` in production as it disables CORS protection.**

## Need Help?

If you're still experiencing issues after configuring CORS:

1. Check browser console for specific error messages
2. Verify the backend URL in your `.env` file
3. Ensure the backend server is running and accessible
4. Check if there are any proxy configurations in your deployment platform