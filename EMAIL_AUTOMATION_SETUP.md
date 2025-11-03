# Email Automation Setup Guide

## Overview

The health profile sharing feature now includes automatic email sending when a share is created. The email includes:
- Share link
- Access code (if required)
- Expiration information
- Personal message (if provided)

## Quick Setup (3 Steps)

### Step 1: Deploy Edge Function

```bash
# If you haven't installed Supabase CLI
npm install -g supabase

# Login and link your project
supabase login
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-health-share-email
```

### Step 2: Choose Email Service

**Option A: Resend (Easiest - Recommended)**
1. Sign up at https://resend.com (free tier available)
2. Get your API key
3. Set secret: `supabase secrets set RESEND_API_KEY=re_xxxxx`

**Option B: Use Supabase SMTP**
1. Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings
2. Configure your SMTP provider (Gmail, SendGrid, AWS SES, etc.)
3. No additional secrets needed

**Option C: SendGrid**
1. Sign up at https://sendgrid.com
2. Get API key
3. Update the Edge Function code to use SendGrid API
4. Set secret: `supabase secrets set SENDGRID_API_KEY=SG.xxxxx`

### Step 3: Test It

1. Go to Health Overview → Share Profile
2. Enter recipient email and create share
3. Check recipient's inbox for email

## Email Service Configuration

### Resend Setup (Recommended)

1. **Sign up** at https://resend.com
2. **Create API Key**:
   - Go to API Keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Set Secret**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

4. **Verify Domain** (Optional for production):
   - Add your domain in Resend dashboard
   - Add DNS records
   - Update "from" address in Edge Function

### Supabase SMTP Setup

1. **Go to Dashboard**:
   - Project Settings → Auth → SMTP Settings

2. **Configure Provider**:
   
   **Gmail (for testing)**:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: [App Password from Google]
   - Sender email: `your-email@gmail.com`
   - Sender name: `Livepet`

   **SendGrid**:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: [Your SendGrid API Key]
   - Sender email: `noreply@yourdomain.com`

3. **Update Edge Function** (if using SMTP):
   - Modify the function to use Supabase's email functions
   - Or keep Resend for better deliverability

## Testing

### Test Locally

```bash
# Serve function locally
supabase functions serve send-health-share-email

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-health-share-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "shareId": "test-id",
    "recipientEmail": "your-email@example.com",
    "petName": "Buddy",
    "shareLink": "https://app.com/shared/health/token123",
    "accessCode": "123456",
    "expirationHours": 24,
    "message": "Test share"
  }'
```

### Test in Production

1. Go to Health Overview
2. Click "Share Profile"
3. Enter your email as recipient
4. Create share
5. Check your inbox

## Email Template Customization

The email template is in:
`supabase/functions/send-health-share-email/index.ts`

You can customize:
- Colors and branding
- Layout and styling
- Content and messaging
- Add your logo

## Troubleshooting

### Email Not Sending?

1. **Check Function Logs**:
   - Supabase Dashboard → Edge Functions → send-health-share-email → Logs
   - Look for errors

2. **Verify Secrets**:
   ```bash
   supabase secrets list
   ```

3. **Check API Key**:
   - For Resend: Verify key is active in Resend dashboard
   - For SMTP: Test SMTP settings in Supabase

4. **Check Spam Folder**:
   - Emails might be filtered
   - Add sender to contacts

### Function Deployment Failed?

1. **Check Supabase CLI**:
   ```bash
   supabase --version
   ```

2. **Verify Project Link**:
   ```bash
   supabase projects list
   ```

3. **Check Permissions**:
   - Ensure you have deployment permissions
   - Check project settings

## Production Checklist

- [ ] Domain verified (for Resend/SendGrid)
- [ ] SMTP configured (if using Supabase SMTP)
- [ ] Function deployed to production
- [ ] Secrets set in production
- [ ] Test email sent successfully
- [ ] Email template customized with branding
- [ ] "From" address configured
- [ ] SPF/DKIM records added (if using custom domain)

## Cost Considerations

**Resend**:
- Free tier: 3,000 emails/month
- Paid: $20/month for 50,000 emails

**Supabase SMTP**:
- Free with your SMTP provider
- Gmail: 500 emails/day limit
- SendGrid: 100 emails/day free

**Recommendation**: Use Resend for production - better deliverability and easier setup.

