# Logout Fix - Force Re-authentication

## Problem
When users logged out and 
tried to sign in again,
 LinkedIn automatically logged them back in with the previous account without showing the login screen.

## Solution Implemented

### 1. **Backend Changes**

#### Added Logout Endpoint (`/auth/logout`)
- New route: `GET /auth/logout`
- Clears server-side session data
- Returns success response

#### Force Account Selection
- Modified LinkedIn OAuth strategy to include `prompt: 'select_account'`
- This forces LinkedIn to show account selection screen every time
- Users can now choose different accounts or re-authenticate

### 2. **Frontend Changes**

#### Enhanced Logout Handler
- Calls backend `/auth/logout` endpoint
- Clears all localStorage data
- Properly removes JWT token
- Redirects to home page

## How It Works Now

1. **User clicks Logout**
   - Frontend calls `http://localhost:3000/auth/logout`
   - Backend processes logout
   - All tokens cleared from localStorage
   - User redirected to home page

2. **User clicks "Sign in with LinkedIn"**
   - LinkedIn OAuth flow starts
   - `prompt=select_account` parameter forces account selection
   - User sees LinkedIn account chooser
   - Can select different account or re-authenticate

3. **Clean Authentication**
   - No cached sessions
   - Fresh authentication flow
   - Proper token management

## Testing the Fix

1. Login with your LinkedIn account
2. Go to dashboard
3. Click **Logout**
4. Click **"Continue with LinkedIn"** again
5. ✅ You should now see LinkedIn's account selection screen
6. ✅ Can choose a different account or re-authenticate

## Technical Details

### LinkedIn OAuth Parameter
```typescript
authorizationParams: {
  prompt: 'select_account'  // Forces account selection
}
```

### Logout Flow
```
User Clicks Logout
    ↓
Frontend: Call /auth/logout
    ↓
Frontend: Clear localStorage
    ↓
Frontend: Redirect to /
    ↓
User Clicks Login
    ↓
LinkedIn: Show Account Selection
    ↓
User: Choose Account
    ↓
Success: New Token Generated
```

## Alternative Options

If you want even stricter logout (force password re-entry):
- Change `prompt: 'select_account'` to `prompt: 'login'`
- This forces users to re-enter their LinkedIn password every time

If you want to remember the user:
- Remove the `authorizationParams` from the strategy
- LinkedIn will automatically log in the same user
