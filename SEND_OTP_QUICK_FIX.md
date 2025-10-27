# Quick Fix: Getting OTP Codes Instead of Magic Links

## The Issue
Supabase sends magic links by default, but we need to display the OTP code in the email.

## Quick Solution

The 6-digit OTP code is already in the magic link URL! Here's how to find it:

### For Now (Use the Code from the Link)
1. Check your email for the magic link
2. Look at the URL structure
3. The OTP code is the 6-digit alphanumeric string in the URL
4. For example: `https://azlrneosewcrrvtghmga.supabase.co/auth/v1/verify?token=**abcdef**&type=email&redirect_to=...`
5. Use that code in the app

### Permanent Fix: Update Supabase Email Template

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Click on the **Magic Link** template
3. Update the HTML content to show the OTP code:

```html
<h2>Verify your email</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>Or click this link to verify: <a href="{{ .ConfirmationURL }}">Verify Email</a></p>
```

4. Save the template
5. Now future emails will display the code

## Test It
1. Try signing up again
2. Check your email - you should now see the code displayed
3. Enter that code in the app

