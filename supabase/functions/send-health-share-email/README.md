# Send Health Share Email Edge Function

This Supabase Edge Function sends email notifications when a health profile is shared.

## Setup

### 1. Deploy the Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-health-share-email
```

### 2. Set Environment Variables

In Supabase Dashboard → Edge Functions → send-health-share-email → Settings:

**Option A: Using Resend (Recommended)**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Option B: Using SendGrid**
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
```

**Option C: Using Supabase SMTP**
Configure SMTP in Supabase Dashboard → Project Settings → Auth → SMTP Settings

### 3. Update Function Secrets

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

## Email Service Options

### Option 1: Resend (Recommended)

1. Sign up at https://resend.com
2. Get your API key
3. Set `RESEND_API_KEY` secret
4. Update the "from" address in the function to your verified domain

### Option 2: SendGrid

1. Sign up at https://sendgrid.com
2. Get your API key
3. Update the function to use SendGrid API
4. Set `SENDGRID_API_KEY` secret

### Option 3: Supabase SMTP

1. Configure SMTP in Supabase Dashboard
2. Use Supabase's built-in email functions
3. No additional API keys needed

## Testing

Test the function locally:

```bash
supabase functions serve send-health-share-email
```

Then call it with:

```bash
curl -X POST http://localhost:54321/functions/v1/send-health-share-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "shareId": "uuid",
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "petName": "Buddy",
    "shareLink": "https://app.livepet.com/shared/health/token123",
    "accessCode": "123456",
    "expirationHours": 24,
    "message": "Check out Buddy's health profile"
  }'
```

## Email Template

The function generates a beautiful HTML email with:
- Personal greeting
- Share link with button
- Access code (if required)
- Expiration information
- Security notice

You can customize the HTML template in the function code.

