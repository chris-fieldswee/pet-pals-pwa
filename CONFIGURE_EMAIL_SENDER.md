# Configure Email Sender in Supabase

## Change the "From" Address for OTP Emails

Supabase sends OTP codes via email. Here's how to customize the sender:

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Authentication → Email Templates**
   - Open your Supabase Dashboard
   - Navigate to **Authentication** → **Email Templates**

2. **Customize the Template**
   - Find the **Magic Link** template (used for OTP)
   - Click **Edit**

3. **Update the Sender Information**
   - In the email subject, you can't directly change the "from" address in the template
   - But you can customize the email content

### Option 2: Using SMTP (Recommended for Production)

To have full control over the sender email and appearance:

1. **Go to Project Settings → Auth → SMTP Settings**

2. **Enable Custom SMTP**
   - Toggle on **Enable Custom SMTP**
   
3. **Configure SMTP Provider**

   **Option A: Using SendGrid**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: Livepet
   ```

   **Option B: Using AWS SES**
   ```
   Host: email-smtp.us-east-1.amazonaws.com
   Port: 587
   Username: [Your AWS Access Key]
   Password: [Your AWS Secret Key]
   Sender email: noreply@yourdomain.com
   Sender name: Livepet
   ```

   **Option C: Using Gmail (for testing)**
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [Your App Password]
   Sender email: your-email@gmail.com
   Sender name: Livepet
   ```

4. **Configure Sender Details**
   - **Sender email**: The "from" address users will see
   - **Sender name**: The name shown as the sender (e.g., "Livepet")

### Option 3: Domain Verification (Best Practice)

For a branded email address like `noreply@yourdomain.com`:

1. **Verify Your Domain**
   - In **Project Settings → Auth**
   - Add your domain
   - Add the required DNS records

2. **Update Sender Email**
   - Use your verified domain email
   - Example: `noreply@livepet.com`

## Update Email Template Content

While in the Email Templates section, you can customize:

### Subject Line
```
Your Livepet verification code
```

### Email Body
```html
<h2>Your Verification Code</h2>
<p>Hi there!</p>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 1 hour.</p>
<p>If you didn't request this code, you can safely ignore this email.</p>
```

## Testing the Configuration

1. **Test Email Sending**
   - Go to **Authentication** → **Users**
   - Try the signup flow
   - Check your inbox for the OTP code

2. **Verify Sender**
   - Check that the email comes from your configured sender
   - Verify the sender name displays correctly

## Current Setup (Default Supabase)

Your current setup uses Supabase's default email service:
- **From**: `noreply@mail.app.supabase.io` (or similar)
- **Provider**: Supabase email service
- **Limitation**: Can't customize sender email/name

## Recommended Next Steps

For production:
1. ✅ Set up custom SMTP with your domain
2. ✅ Customize email templates with your branding
3. ✅ Verify your domain in Supabase
4. ✅ Update sender name to "Livepet"

This makes your OTP emails look more professional and trustworthy.

