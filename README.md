# ROI Warehouse Management System

A comprehensive warehouse management system built with React, Redux, and Netlify Functions.

## Architecture

This application uses a unified deployment architecture where both the frontend and backend are deployed to the same Netlify site. This approach eliminates CORS issues by ensuring all API requests stay within the same domain.

### Frontend
- React with Redux for state management
- Vite for fast development and optimized builds
- Material UI for component styling
- Axios for API requests

### Backend
- Netlify Functions (serverless) for API endpoints
- MongoDB Atlas for data storage
- JWT for authentication

## Deployment

The application is deployed to Netlify with both frontend and backend on the same site:

- Production URL: https://wms-roi.netlify.app
- API endpoints: https://wms-roi.netlify.app/.netlify/functions/*

## Development

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB for development)

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the development server: `npm run dev`

### Unified Deployment
This project uses a unified deployment approach where both frontend and backend are deployed to the same Netlify site. This eliminates CORS issues and simplifies the architecture.

Key benefits:
- No CORS headers or preflight requests needed
- Simplified API URL configuration (using relative paths)
- Reduced network overhead
- Easier maintenance

For more details, see the [UNIFIED_DEPLOYMENT_PLAN.md](./UNIFIED_DEPLOYMENT_PLAN.md) and [UNIFIED_DEPLOYMENT_CHECKLIST.md](./UNIFIED_DEPLOYMENT_CHECKLIST.md) files.
