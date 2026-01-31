# 📧 Custom Email Confirmation Template

## Overview

This guide shows how to customize the email confirmation template in Supabase to match your brand and improve user experience.

---

## Custom Email Template

### Email Subject Line
```
Confirm Your Email to Activate Your Cybersec-Arena Account
```

### Email Body (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #8B5CF6;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #8B5CF6;
            margin-bottom: 10px;
        }
        .greeting {
            font-size: 22px;
            color: #0a0f1a;
            margin: 20px 0;
            font-weight: 600;
        }
        .content {
            color: #555;
            font-size: 16px;
            margin: 20px 0;
            line-height: 1.8;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 2px solid #8B5CF6;
        }
        .cta-button {
            display: inline-block;
            background-color: #8B5CF6;
            color: #ffffff;
            padding: 15px 40px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 18px;
            font-weight: 600;
            margin: 10px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #7c3aed;
        }
        .emoji {
            font-size: 24px;
            margin: 0 5px;
        }
        .alt-link {
            font-size: 12px;
            color: #888;
            word-break: break-all;
            margin-top: 15px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
            font-family: monospace;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .security-note {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #2e7d32;
        }
        .urgency {
            color: #f57c00;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🛡️ Cybersec-Arena</div>
            <p style="color: #999; margin: 0; font-size: 14px;">Interactive Cybersecurity Learning Platform</p>
        </div>

        <!-- Greeting -->
        <div class="greeting">Hi {{ user_metadata.name || 'there' }},</div>

        <!-- Welcome Message -->
        <div class="content">
            <p><strong>Welcome to Cybersec-Arena</strong> 👋</p>
            <p>We're excited to have you join our interactive cybersecurity learning platform!</p>
            <p>You now have access to:</p>
            <ul style="color: #555; padding-left: 20px;">
                <li><strong>50+ CTF Challenges</strong> - Cryptography, Web, Forensics & more</li>
                <li><strong>Phishing Hunt</strong> - Learn to identify malicious emails</li>
                <li><strong>Code Security</strong> - Fix vulnerable code patterns</li>
                <li><strong>Cyber Quiz</strong> - Test your security knowledge</li>
                <li><strong>Threat Radar</strong> - Analyze cyber threats</li>
                <li><strong>Global Leaderboard</strong> - Compete with other learners</li>
            </ul>
        </div>

        <!-- Security Note -->
        <div class="security-note">
            🔒 <strong>Security:</strong> We need to verify your email address to secure your account and prevent unauthorized access.
        </div>

        <!-- Call-to-Action -->
        <div class="cta-section">
            <div style="font-size: 18px; margin-bottom: 20px; font-weight: 600;">
                <span class="emoji">🔐</span>Confirm Your Email Address
            </div>
            <a href="{{ confirmation_link }}" class="cta-button">Verify Email Now</a>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">This link expires in 24 hours</p>
            <div class="alt-link">
                Or copy and paste this link:<br>
                {{ confirmation_link }}
            </div>
        </div>

        <!-- Next Steps -->
        <div class="content" style="background-color: #f5f5f5; padding: 20px; border-radius: 6px;">
            <p><strong>What's Next?</strong></p>
            <ol style="color: #555;">
                <li>Confirm your email by clicking the button above</li>
                <li>Log in to your Cybersec-Arena account</li>
                <li>Complete your profile and choose your first challenge</li>
                <li>Start learning and earning badges! 🏆</li>
            </ol>
        </div>

        <!-- Support Section -->
        <div class="content">
            <p><strong>Need Help?</strong></p>
            <ul style="color: #555; padding-left: 20px;">
                <li><strong>Email didn't confirm?</strong> Check your spam/junk folder or request a new confirmation email after logging in</li>
                <li><strong>Link expired?</strong> No problem! You can request a new one from the login page</li>
                <li><strong>Account issues?</strong> Contact our support team at support@cybersec-arena.com</li>
            </ul>
        </div>

        <!-- Security Warning -->
        <div class="security-note" style="background-color: #fff3e0; border-left-color: #f57c00; color: #e65100;">
            ⚠️ <strong>Important:</strong> If you didn't sign up for this account, please ignore this email. Your email address is important to us, and we never share it with third parties.
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 10px 0;">
                <strong>Cybersec-Arena</strong><br>
                Interactive Cybersecurity Learning Platform
            </p>
            <p style="margin: 10px 0; color: #aaa;">
                © 2025 Cybersec-Arena. All rights reserved.<br>
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
```

---

## How to Set This Up in Supabase

### Step 1: Go to Supabase Dashboard

1. Open [supabase.com](https://supabase.com)
2. Login to your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Select "Confirm signup" Template

1. Under "Email Templates", find **"Confirm signup"**
2. Click on it to edit

### Step 3: Customize the Template

#### Subject Line
Replace the default subject with:
```
Confirm Your Email to Activate Your Cybersec-Arena Account
```

#### Email Body
Replace the entire body with the HTML template above (or use plain text version below)

### Step 4: Template Variables

Use these Supabase variables in your template:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ confirmation_link }}` | Full confirmation link with token | `https://cybersec-arena.com/confirm-email?token_hash=...` |
| `{{ user_metadata.name }}` | User's name (from signup data) | `John Doe` |
| `{{ email }}` | User's email address | `john@example.com` |
| `{{ user_metadata.username }}` | User's username | `john_doe` |
| `{{ token_hash }}` | Raw token (if needed) | `abc123xyz...` |

### Step 5: Save and Test

1. Click **"Save"** button
2. Scroll down to **"Test email template"** section
3. Enter a test email address
4. Click **"Send test email"**
5. Check your email inbox to preview the template

---

## Plain Text Version (Fallback)

If you want to provide a plain text alternative:

```
CONFIRM YOUR EMAIL TO ACTIVATE YOUR CYBERSEC-ARENA ACCOUNT

Hi {{ user_metadata.name || 'there' }},

Welcome to Cybersec-Arena 👋

We're excited to have you join our interactive cybersecurity learning platform!

To get started and secure your account, please confirm your email address by clicking the button below:

🔐 CONFIRM YOUR EMAIL ADDRESS
{{ confirmation_link }}

This link expires in 24 hours.

WHAT'S NEXT?
1. Confirm your email by clicking the link above
2. Log in to your Cybersec-Arena account
3. Complete your profile
4. Start learning and earning badges! 🏆

NEED HELP?
- Email didn't arrive? Check spam/junk folder or request a new confirmation email
- Link expired? Request a new one from the login page
- Account issues? Contact support@cybersec-arena.com

SECURITY NOTE:
If you didn't sign up for this account, please ignore this email. Your email is important to us and is never shared with third parties.

© 2025 Cybersec-Arena. All rights reserved.
---
This is an automated email. Please do not reply to this message.
```

---

## Visual Preview

```
═══════════════════════════════════════════════════════════════

FROM: noreply@supabase.io
TO: john@example.com
SUBJECT: Confirm Your Email to Activate Your Cybersec-Arena Account

═══════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────┐
│                                                             │
│  🛡️ Cybersec-Arena                                         │
│  Interactive Cybersecurity Learning Platform              │
│  ─────────────────────────────────────────────────────    │
│                                                             │
│  Hi John,                                                  │
│                                                             │
│  Welcome to Cybersec-Arena 👋                              │
│  We're excited to have you join our interactive           │
│  cybersecurity learning platform!                         │
│                                                             │
│  You now have access to:                                   │
│  • 50+ CTF Challenges                                     │
│  • Phishing Hunt                                          │
│  • Code Security                                          │
│  • Cyber Quiz                                             │
│  • Threat Radar                                           │
│  • Global Leaderboard                                     │
│                                                             │
│  🔒 Security: We need to verify your email address to     │
│  secure your account and prevent unauthorized access.    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🔐 Confirm Your Email Address                       │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  VERIFY EMAIL NOW                            │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                       │ │
│  │  This link expires in 24 hours                      │ │
│  │                                                       │ │
│  │  Or copy and paste:                                 │ │
│  │  https://cybersec-arena.com/confirm-email?...      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  WHAT'S NEXT?                                              │
│  1. Confirm your email                                    │
│  2. Log in to your account                                │
│  3. Complete your profile                                 │
│  4. Start learning! 🏆                                    │
│                                                             │
│  ⚠️  If you didn't sign up, ignore this email.           │
│                                                             │
│  © 2025 Cybersec-Arena. All rights reserved.             │
│                                                             │
└────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
```

---

## Implementation Checklist

- [ ] Copy the HTML template above
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Authentication → Email Templates
- [ ] Click "Confirm signup" template
- [ ] Update subject line
- [ ] Paste HTML template into body
- [ ] Verify all template variables are correct
- [ ] Click "Save"
- [ ] Send test email to verify appearance
- [ ] Check email in inbox and spam folder
- [ ] Test full signup flow
- [ ] Verify confirmation link works

---

## Testing the Email

### Step 1: Send Test Email

1. In Supabase **Email Templates** section
2. Scroll to **"Test email template"**
3. Enter your test email address
4. Click **"Send test email"**

### Step 2: Check Email

1. Open your email inbox
2. Look for email from `noreply@supabase.io`
3. Subject should be: "Confirm Your Email to Activate Your Cybersec-Arena Account"
4. Verify all content displays correctly

### Step 3: Verify Links

1. Check that confirmation link is clickable
2. Test that it works by clicking the link
3. Verify redirect to `/confirm-email` page works
4. Check email confirmation completes successfully

### Step 4: Full Signup Test

1. Go to your app signup page
2. Create a test account
3. Check email for confirmation message
4. Click confirmation link
5. Verify email is confirmed
6. Try logging in with the account

---

## Customization Tips

### Change Colors
Modify these hex codes in the CSS:
- **Primary color** (Purple): `#8B5CF6` → Change to your brand color
- **Secondary color** (Text): `#0a0f1a` → Dark theme color
- **Accent color** (Links): `#7c3aed` → Hover state color

### Change Logo/Branding
Replace `🛡️ Cybersec-Arena` with:
- Your company logo (as emoji or image)
- Your brand name
- Company tagline

### Add Company Info
In the footer section, update:
- Company name
- Support email address
- Website URL
- Social media links

### Adjust Text
Modify the welcome message, features list, and support instructions to match your needs.

---

## Troubleshooting

### Email not sending
- ✅ Verify email confirmation is enabled in Settings
- ✅ Check Supabase project is not in free tier with email limitations
- ✅ Verify sender email is configured
- ✅ Check email doesn't have syntax errors

### Template variables not working
- ✅ Use exact variable names: `{{ confirmation_link }}`
- ✅ Don't use custom variables that aren't in user_metadata
- ✅ Test with `{{ email }}` to verify variable system works

### Email looks broken in client
- ✅ HTML might not be rendering - test plain text version
- ✅ Some email clients strip CSS - use inline styles
- ✅ Images might not load - test with emoji instead

### Link doesn't work
- ✅ Verify `{{ confirmation_link }}` variable is included
- ✅ Test the full confirmation flow in development
- ✅ Check redirect URL is correct in Supabase Settings

---

## Production Considerations

1. **Test thoroughly** before deploying to production
2. **Monitor email delivery** rates in Supabase Analytics
3. **Update footer** with your actual support email
4. **Customize colors** to match your brand
5. **Add company logo** if possible
6. **Test across clients** (Gmail, Outlook, Apple Mail, etc.)
7. **Monitor bounce rates** and adjust template if needed
8. **Keep subject line** professional and clear

---

## Next Steps

After customizing the email template:

1. ✅ Test email sending
2. ✅ Verify template displays correctly
3. ✅ Test full signup → confirmation → login flow
4. ✅ Monitor email delivery in production
5. ✅ Gather user feedback on email clarity
6. ✅ Update as needed based on feedback

