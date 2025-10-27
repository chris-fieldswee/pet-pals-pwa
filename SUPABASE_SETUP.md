# Supabase Configuration Instructions

To enable OTP email verification in your Livepet app, you need to configure the following settings in your Supabase dashboard.

## Steps to Configure

### 1. Enable Email Auth Provider

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Make sure **Email** provider is enabled (it should be by default)

### 2. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. You should see templates for different auth flows
3. Click on **Magic Link** template to customize if needed
4. The OTP code will be sent using this template

### 3. Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173` (or your production URL)
3. Add redirect URLs if needed (not required for OTP flow)

### 4. CRITICAL: Configure OTP Codes Instead of Magic Links

To receive actual OTP codes instead of magic links:

1. Go to **Authentication** → **URL Configuration**
2. Under **SMTP Settings**, make sure SMTP is configured OR
3. Navigate to **Authentication** → **Templates**
4. Modify the **Magic Link** template to include OTP codes
5. **IMPORTANT**: In the template, the OTP code is available as `{{ .Token }}`
6. Update the email body to display: "Your code is: **{{ .Token }}**"

**Alternative Configuration:**
1. Go to **Project Settings** → **Auth**
2. Under **Email Auth**, find **OTP Length**
3. Set it to **6** (default is usually 6)
4. This ensures Supabase sends numeric codes

**Note**: By default, Supabase sends magic links. The code `{{ .Token }}` in the email template will show the OTP code. Make sure your email template displays this token.

### 5. Important: Email Confirmation

For the signup flow to work with OTP verification:

1. Go to **Authentication** → **Settings**
2. Under **Auth Settings**, find **Email Auth**
3. **Disable** email confirmation for new users:
   - Set **Confirm email** to `false` (not required)
   - This allows the OTP flow to complete immediately

**Why?** Our custom flow handles email verification through OTP codes, so we don't need Supabase's built-in email confirmation.

### 6. Verify Email Service Provider

1. Go to **Project Settings** → **Auth**
2. Check that your email service provider is configured
3. Supabase provides a free tier with limited emails
4. For production, consider configuring:
   - **SMTP** (SendGrid, AWS SES, etc.)
   - Or use Supabase's built-in email service

### 7. Test the Flow

Once configured:

1. Run the app locally
2. Click "Join Livepet"
3. Enter your email
4. Check your email for the OTP code
5. Enter the code and complete signup

## Troubleshooting

### Received Magic Link Instead of Code?

This happens when Supabase is configured to send magic links. To fix:

1. **Check your Email Template**:
   - Go to Authentication → Templates
   - Open the **Magic Link** template
   - Make sure it includes: `{{ .Token }}` to display the code

2. **Alternative**: Use a 6-digit magic link password:
   - Supabase may send a short magic link with a token
   - Extract the 6-digit code from the URL

3. **Best Solution**: Customize the email template to show:
   ```
   Your verification code is: {{ .Token }}
   
   Enter this code in the app, or click the link to verify:
   {{ .ConfirmationURL }}
   ```

### Not Receiving OTP Emails?

1. **Check spam folder**
2. **Verify email provider is working**:
   - Go to Supabase Dashboard → Project Settings → Auth
   - Check email service status
3. **Check Supabase logs**:
   - Go to Logs → Auth logs
   - Look for errors related to email sending
4. **Free tier limits**:
   - Supabase free tier has email sending limits
   - Check if you've exceeded the limit

### OTP Code Not Working?

1. **Verify the email you're using matches** exactly (case-sensitive in some cases)
2. **Check the code is 6 digits** (as per Supabase default)
3. **Code expires**:
   - Default expiry is 1 hour
   - Request a new code if expired
4. **Check browser console** for any error messages

### User Creation Issues?

1. **Check the `handle_new_user()` function** exists in your database
2. **Verify RLS policies** are set correctly for profiles table
3. **Check migration** `20251027133117_09585c05-deb0-493f-9bfc-39f1f487e65e.sql` was applied

## Environment Variables

Make sure these are correctly set in your Supabase client:

```typescript
const SUPABASE_URL = "https://azlrneosewcrrvtghmga.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

These are already configured in `src/integrations/supabase/client.ts`.

## Current Implementation

The app now uses:

1. **OTP for Sign Up**: Users receive a 6-digit code via email
2. **Code Verification**: User enters code to verify email
3. **Password Setup**: After verification, user sets password and completes profile
4. **Standard Sign In**: Existing users can sign in with email and password

## How It Works

### Sign Up Flow
1. User enters email → `EmailEntry`
2. OTP code sent to email → `VerifyCode`
3. User enters code → code verified
4. User enters first name, password, opt-in → `CreateAccount`
5. Account created with user metadata → `Success` → `Dashboard`

### Sign In Flow
1. User clicks "Sign In" → `SignIn`
2. User enters email and password
3. Authenticates with Supabase
4. Redirects to `Dashboard`

## Security Notes

- **OTP codes** are single-use and expire
- **Passwords** are hashed by Supabase (bcrypt)
- **RLS policies** protect user data
- **Session tokens** are stored in localStorage (configurable)
- **Auto-refresh** is enabled for token management

