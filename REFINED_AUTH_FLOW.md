# Refined Authentication Flow

## Summary of Changes

The authentication flow has been completely refactored to provide a more secure and user-friendly experience with OTP email verification for sign up and standard email/password for sign in.

## New Features

### 1. **Separate Sign Up and Sign In Flows**
- **Sign Up**: Uses OTP email verification
- **Sign In**: Standard email/password authentication

### 2. **OTP-Based Sign Up**
- User receives a 6-digit code via email
- Code expires after 1 hour
- Email must be verified before proceeding

### 3. **Standard Sign In**
- Existing users can sign in with email and password
- No need to go through the full registration process

## Updated Components

### New Files Created
1. **`src/pages/onboarding/SignIn.tsx`** - Sign in page for existing users
2. **`src/pages/onboarding/VerifyCode.tsx`** - OTP code verification page
3. **`SUPABASE_SETUP.md`** - Supabase configuration instructions

### Modified Files
1. **`src/hooks/useAuth.tsx`**
   - Added `sendOTP()` method to send OTP codes
   - Removed `verifyOTP()` from auth context (moved to components)
   - Kept `signIn()` for standard authentication

2. **`src/pages/onboarding/EmailEntry.tsx`**
   - Now sends OTP code to user's email
   - Navigates to verification page

3. **`src/pages/onboarding/CreateAccount.tsx`**
   - Updated to work after OTP verification
   - User is already logged in at this point
   - Sets password and user metadata

4. **`src/pages/Welcome.tsx`**
   - Reordered buttons: Sign In (primary), Join Livepet (secondary)

5. **`src/App.tsx`**
   - Added routes for `/onboarding/signin` and `/onboarding/verify-code`

## Authentication Flows

### Sign Up Flow (New Users)
```
1. Welcome Screen
   ↓ Click "Join Livepet"
2. Email Entry
   ↓ Enter email
3. OTP Code Sent
   ↓ Check email for 6-digit code
4. Verify Code
   ↓ Enter code
5. User is logged in
   ↓ (automatic)
6. Create Account
   ↓ Enter first name, password, opt-in
7. Account Created
   ↓ (metadata saved)
8. Success Screen
   ↓ Click "Add Your Pet"
9. Add Pet
   ↓ Continue...
10. Dashboard
```

### Sign In Flow (Existing Users)
```
1. Welcome Screen
   ↓ Click "Sign In"
2. Sign In Page
   ↓ Enter email and password
3. Authenticated
   ↓ (automatic)
4. Dashboard
```

## Technical Details

### Security Features
- **OTP Codes**: Single-use, expire after 1 hour
- **Password Requirements**: 8+ chars, uppercase, lowercase, number
- **Session Management**: Automatic token refresh
- **Row Level Security**: Enforced at database level

### Supabase Integration
The app now uses:
- `signInWithOtp()` - For sending OTP codes
- `verifyOtp()` - For verifying codes (logs user in)
- `updateUser()` - For setting password and metadata after OTP verification
- `signInWithPassword()` - For standard email/password sign in

### Data Flow
1. User enters email → OTP sent
2. User enters code → Verified and logged in
3. User enters details → Password and metadata saved
4. Profile created automatically via database trigger

## Supabase Configuration Required

See `SUPABASE_SETUP.md` for detailed configuration instructions.

**Key Settings:**
1. Enable Email provider
2. Disable email confirmation (our flow handles it)
3. Configure email templates
4. Set site URL

## Testing the Flow

### Test Sign Up
1. Navigate to http://localhost:8081
2. Click "Join Livepet"
3. Enter your email
4. Check email for OTP code
5. Enter the 6-digit code
6. Fill out account details
7. Complete onboarding

### Test Sign In
1. Navigate to http://localhost:8081
2. Click "Sign In"
3. Enter email and password
4. Should redirect to dashboard

### Verify Database
After signing up, check Supabase:
- `auth.users` table - should have new user
- `profiles` table - should have user profile with metadata
- Verify RLS policies are working

## Known Limitations

1. **Email Templates**: Currently using default Supabase templates
   - Customize in Supabase dashboard
2. **Resend Code**: Not implemented yet
   - User must go back to restart flow
3. **Password Reset**: Not implemented yet
   - Coming soon
4. **Photo Upload**: Not implemented yet
   - Placeholder UI only

## Next Steps

1. Configure Supabase per instructions
2. Test the full flow
3. Customize email templates
4. Implement resend code functionality
5. Add password reset flow

