# Unified Deployment Checklist

This checklist ensures all necessary steps are completed for the unified deployment of the ROI Warehouse Management System, eliminating CORS issues by hosting both frontend and backend on the same Netlify site.

## Pre-Deployment Tasks

- [x] Update `src/api/index.js` to use relative paths (`/.netlify/functions`) for API requests
- [x] Update `netlify.toml` to remove CORS headers and simplify redirects
- [x] Create unified versions of backend functions without CORS handling
- [x] Replace original backend functions with unified versions:
  - [x] `companies.js`
  - [x] `auth-login.js`
  - [x] `auth-logout.js`
  - [x] `questionnaire.js`
  - [x] `users.js`
  - [x] `test-cors.js`
  - [ ] Other functions (check with `check-unified-implementation.js`)
- [x] Remove `.env.production` file with API URL environment variables
- [x] Create verification scripts:
  - [x] `test-unified-deployment.js` for local testing
  - [x] `verify-unified-deployment.js` for production verification
- [x] Create `check-unified-implementation.js` to verify all functions are updated

## Deployment Steps

1. [ ] Commit all changes to version control
2. [ ] Deploy to the frontend Netlify site (`https://wms-roi.netlify.app`)
3. [ ] Verify the deployment using `verify-unified-deployment.js`
4. [ ] Test all major functionality:
   - [ ] User authentication (login/logout)
   - [ ] Company management
   - [ ] Questionnaire functionality
   - [ ] User management
   - [ ] Process and presentation uploads

## Post-Deployment Tasks

1. [ ] Monitor Netlify logs for any errors
2. [ ] Decommission the separate backend Netlify site
3. [ ] Update documentation to reflect the unified architecture
4. [ ] Remove any remaining CORS-related code or configuration

## Rollback Plan

If issues arise with the unified deployment:

1. [ ] Restore the original backend functions with CORS handling
2. [ ] Restore the `.env.production` file with the backend API URL
3. [ ] Update `src/api/index.js` to use the environment variable for API requests
4. [ ] Redeploy both frontend and backend separately
5. [ ] Verify the rollback by testing API functionality

## Notes

- The unified deployment approach eliminates CORS issues by ensuring all requests stay within the same domain
- This simplifies the architecture and improves performance by removing preflight requests
- All backend functions now use consistent MongoDB connections
- JWT authentication and security measures remain unchanged
- Environment variables for JWT secret and MongoDB connection string are still required
