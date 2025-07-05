# Unified Deployment Plan for ROI Application

This document outlines the steps to unify the deployment of the ROI application, eliminating CORS issues by hosting both frontend and backend on the same domain.

## 1. Changes Already Made

### API Configuration
- Updated `src/api/index.js` to use relative paths (`/.netlify/functions`) instead of absolute URLs
- Removed dependency on environment variables for API URL

### Netlify Configuration
- Simplified `netlify.toml` by removing CORS-specific headers
- Maintained redirect rules for API requests

### Backend Functions
- Created CORS-free versions of Netlify Functions:
  - `companies-unified.js`
  - `auth-login-unified.js`
- Created documentation-only version of CORS utility:
  - `corsHeaders-unified.js`

## 2. Remaining Steps for Deployment

### Step 1: Replace All Function Files
```bash
# Replace the original files with the unified versions
copy -Force netlify/functions/companies-unified.js netlify/functions/companies.js
copy -Force netlify/functions/auth-login-unified.js netlify/functions/auth-login.js
copy -Force netlify/functions/utils/corsHeaders-unified.js netlify/functions/utils/corsHeaders.js
```

### Step 2: Update All Other Netlify Functions
Apply the same pattern to all other Netlify Functions:
- Remove CORS-specific code
- Remove references to CORS utilities
- Return responses without CORS headers

### Step 3: Remove Environment Files
```bash
# Remove environment files that set API URL
rm .env.production
```

### Step 4: Deploy to Frontend Netlify Site
1. Log in to Netlify dashboard
2. Select the frontend site (`wms-roi.netlify.app`)
3. Deploy the updated codebase
4. Verify that both frontend and backend are working on the same domain

### Step 5: Update DNS and Redirects (Optional)
If you want to maintain backward compatibility:
1. Set up redirects from the old backend domain to the new unified domain
2. Update DNS settings if needed

## 3. Testing After Deployment

### Frontend Tests
- Test user authentication
- Test company creation and listing
- Test all other frontend features

### Backend Tests
- Test direct API access via `/.netlify/functions/*` endpoints
- Verify database connections are working
- Check logs for any errors

## 4. Rollback Plan

If issues arise with the unified deployment:
1. Restore the original CORS-enabled files
2. Restore the environment variables
3. Deploy to separate frontend and backend sites

## 5. Benefits of Unified Deployment

- **Eliminated CORS Issues**: No more cross-origin requests
- **Simplified Architecture**: Single deployment to manage
- **Improved Performance**: No preflight requests
- **Enhanced Security**: Reduced attack surface
- **Easier Debugging**: Consolidated logs in one place

---

For any questions or issues with this deployment plan, please contact the development team.
