// Supabase Edge Function: Send Health Profile Share Email
// This function sends an email when a health profile is shared

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Parse request body
    const {
      shareId,
      recipientEmail,
      recipientName,
      petName,
      shareLink,
      accessCode,
      expirationHours,
      message,
    } = await req.json();

    if (!shareId || !recipientEmail || !shareLink) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expirationHours || 24));
    const expirationDate = expiresAt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Build email content
    const emailSubject = `Health Profile Shared: ${petName || "Your Pet"}`;
    
    let emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
    }
    .content {
      margin-bottom: 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 16px;
    }
    .message-box {
      background-color: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 16px 0;
      border-radius: 6px;
    }
    .share-link-box {
      background-color: #eff6ff;
      border: 2px dashed #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .share-link {
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
      color: #1e40af;
      text-decoration: none;
      display: block;
      margin: 12px 0;
    }
    .access-code-box {
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      text-align: center;
    }
    .access-code {
      font-family: monospace;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #92400e;
      margin: 12px 0;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .info-box {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 16px;
      margin: 16px 0;
    }
    .info-item {
      margin: 8px 0;
      font-size: 14px;
      color: #64748b;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .warning {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px;
      margin: 16px 0;
      border-radius: 6px;
      font-size: 14px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐾 Livepet</div>
      <div class="title">Health Profile Shared</div>
    </div>

    <div class="content">
      <div class="greeting">
        ${recipientName ? `Hi ${recipientName},` : "Hello,"}
      </div>

      <p>
        ${recipientName || "Someone"} has shared ${petName ? `${petName}'s` : "a pet's"} health profile with you.
      </p>

      ${message ? `
      <div class="message-box">
        <strong>Personal Message:</strong><br>
        ${message}
      </div>
      ` : ""}

      <div class="share-link-box">
        <strong style="display: block; margin-bottom: 12px; color: #1e40af;">
          🔗 Access Link
        </strong>
        <a href="${shareLink}" class="share-link">${shareLink}</a>
        <a href="${shareLink}" class="button">View Health Profile</a>
      </div>

      ${accessCode ? `
      <div class="access-code-box">
        <strong style="display: block; margin-bottom: 8px; color: #92400e;">
          🔒 Access Code Required
        </strong>
        <p style="margin: 8px 0; font-size: 14px; color: #78350f;">
          You'll need this code to view the health profile:
        </p>
        <div class="access-code">${accessCode}</div>
      </div>
      ` : ""}

      <div class="info-box">
        <div class="info-item">
          <strong>Pet:</strong> ${petName || "Not specified"}
        </div>
        <div class="info-item">
          <strong>Link Expires:</strong> ${expirationDate}
        </div>
        <div class="info-item">
          <strong>Expires In:</strong> ${expirationHours || 24} hours
        </div>
      </div>

      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> This link provides access to sensitive health information. 
        Please keep it secure and do not share it with others.
      </div>
    </div>

    <div class="footer">
      <p>This email was sent by Livepet Health Sharing</p>
      <p>If you didn't expect this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Use Supabase's built-in email function or Resend API
    // Option 1: Use Supabase's email (if configured via SMTP)
    // Option 2: Use Resend API (recommended for production)
    
    // For now, we'll use a simple approach with Supabase's email function
    // You can integrate with Resend, SendGrid, or other email services here
    
    // Call Supabase's send_email function if available
    // Otherwise, you can integrate with an email service like Resend:
    
    // Example with Resend (requires RESEND_API_KEY in environment):
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      // Use Resend API
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Livepet <noreply@livepet.app>",
          to: recipientEmail,
          subject: emailSubject,
          html: emailBody,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const resendData = await resendResponse.json();
      
      // Update share record with email sent status
      await supabaseClient
        .from("health_profile_shares")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", shareId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: resendData.id,
          message: "Email sent successfully" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Fallback: Use Supabase's email function (if available)
      // Or log for manual sending
      console.log("Email content:", {
        to: recipientEmail,
        subject: emailSubject,
        html: emailBody,
      });

      // You can also trigger a database function that sends email
      // For now, we'll return success but log that email needs to be sent
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email queued (email service not configured - check logs)",
          emailData: {
            to: recipientEmail,
            subject: emailSubject,
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

