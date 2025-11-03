# Health Profile Sharing Feature

## Overview
This feature allows users to securely share their pet's health profile with veterinarians, pet sitters, or other caregivers via time-limited, secure links.

## Implementation Status

### ✅ Completed

1. **Database Schema** (`create_health_sharing_feature.sql`)
   - `health_profile_shares` table - stores share configurations
   - `health_share_access_logs` table - tracks access attempts
   - Helper functions for token generation and validation
   - RLS policies for security

2. **Share Modal Component** (`ShareHealthProfileModal.tsx`)
   - Recipient email and optional name
   - Custom message
   - Configurable expiration (1 hour to 30 days)
   - Optional max views limit
   - Optional access code for extra security
   - Permissions selection (what sections to share)
   - Share link and code display
   - Copy to clipboard functionality

3. **Shared Profile View** (`SharedHealthProfile.tsx`)
   - Access code verification if required
   - Expiration checking
   - Displays allowed sections (records, vitals, alerts, documents)
   - Access logging

4. **Integration**
   - "Share Profile" button added to Health Overview page
   - Route configured: `/shared/health/:token`

### 📋 To Complete

1. **Email Sending**
   - Currently shows the link in the UI
   - Need to implement email sending via:
     - Supabase Edge Function, OR
     - Email service (SendGrid, AWS SES, etc.)
   
   Email should include:
   - Share link
   - Access code (if required)
   - Expiration information
   - Personal message (if provided)

2. **Edge Function for Email** (Recommended)
   ```javascript
   // supabase/functions/send-health-share-email/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   
   serve(async (req) => {
     // Get share details from request
     // Send email with link and access code
     // Use Supabase's email service or external provider
   })
   ```

3. **Share Management**
   - View active shares list
   - Revoke shares early
   - View access logs
   - Resend email

## How to Use

### For Users

1. Go to Health Overview page
2. Click "Share Profile" button
3. Enter recipient email and optional details
4. Configure access settings (expiration, max views, access code)
5. Select which sections to share
6. Generate link
7. Copy and share the link (or email will be sent automatically)

### For Recipients

1. Click shared link
2. Enter access code if required
3. View allowed health profile sections
4. Link expires automatically after set time or max views

## Database Migration

Run the migration:
```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/create_health_sharing_feature.sql
```

## Security Features

- ✅ Secure token generation (cryptographically random)
- ✅ Optional access code for extra security
- ✅ Time-based expiration
- ✅ View count limits
- ✅ Row Level Security (RLS) policies
- ✅ Access logging
- ✅ Revocation capability
- ✅ Granular permissions (what can be viewed)

## Next Steps

1. **Implement Email Sending**
   - Create Supabase Edge Function
   - Configure email template
   - Add email service integration

2. **Add Share Management UI**
   - List of active shares
   - Ability to revoke shares
   - View access logs

3. **Enhanced Features**
   - Password-protected shares
   - Download PDF export
   - Share specific date ranges
   - Notify on access

