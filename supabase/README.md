# Supabase Database Setup Guide

This guide will help you set up the CyberSec Arena database in Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project (if it doesn't exist):

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit the `.env` file to version control. It should already be in `.gitignore`.

### 3. Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### 4. Configure Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your application URL (e.g., `http://localhost:5173` for development)
5. Add redirect URLs:
   - `http://localhost:5173/confirm-email` (for development)
   - `https://yourdomain.com/confirm-email` (for production)

### 5. Configure Custom Email Templates

#### Step 1: Access Email Templates

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Click on the **"Confirm signup"** template to edit

#### Step 2: Update Subject Line

Replace the default subject with:
```
Confirm Your Email to Activate Your Cybersec-Arena Account
```

#### Step 3: Update Email Body

Replace the entire email body with this HTML template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
            border-bottom: 4px solid #667eea;
        }
        .logo {
            font-size: 32px;
            margin-bottom: 12px;
        }
        .brand-name {
            font-size: 26px;
            font-weight: 700;
            margin: 10px 0;
            letter-spacing: 0.5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.95;
            margin: 5px 0 0 0;
            font-weight: 400;
        }
        .body-content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            color: #8B5CF6;
            margin-bottom: 25px;
            font-weight: 700;
        }
        .greeting-name {
            color: #764ba2;
            font-weight: 800;
        }
        .welcome-section {
            background: linear-gradient(135deg, #f5f3ff 0%, #faf8ff 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #8B5CF6;
            margin-bottom: 30px;
        }
        .welcome-title {
            font-size: 18px;
            color: #764ba2;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .welcome-text {
            color: #555;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 15px;
        }
        .features-list {
            list-style: none;
            margin: 15px 0;
        }
        .features-list li {
            padding: 10px 0;
            color: #555;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        .features-list li:last-child {
            border-bottom: none;
        }
        .feature-icon {
            margin-right: 12px;
            font-size: 18px;
            min-width: 24px;
        }
        .content {
            color: #555;
            font-size: 15px;
            margin: 20px 0;
            line-height: 1.8;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 40px;
            background: linear-gradient(135deg, #f5f3ff 0%, #fff9ff 100%);
            border-radius: 10px;
            border: 2px solid #8B5CF6;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);
        }
        .cta-title {
            font-size: 20px;
            font-weight: 700;
            color: #764ba2;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: #ffffff;
            padding: 16px 50px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 17px;
            font-weight: 700;
            margin: 15px 0;
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
        }
        .expiry-note {
            font-size: 13px;
            color: #888;
            margin-top: 15px;
            font-weight: 500;
        }
        .alt-link {
            font-size: 12px;
            color: #888;
            word-break: break-all;
            margin-top: 20px;
            padding: 12px;
            background-color: #f5f5f5;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            border: 1px dashed #ddd;
        }
        .steps-section {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #8B5CF6;
        }
        .steps-title {
            font-size: 17px;
            color: #764ba2;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .steps-list {
            list-style: none;
            counter-reset: item;
        }
        .steps-list li {
            counter-increment: item;
            padding: 10px 0 10px 35px;
            position: relative;
            color: #555;
            font-size: 14px;
            line-height: 1.6;
        }
        .steps-list li:before {
            content: counter(item);
            position: absolute;
            left: 0;
            top: 0;
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
        }
        .security-note {
            background-color: #e8f5e9;
            border-left: 5px solid #4caf50;
            padding: 18px;
            margin: 25px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #2e7d32;
        }
        .warning-note {
            background-color: #fff3e0;
            border-left: 5px solid #f57c00;
            padding: 18px;
            margin: 25px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #e65100;
        }
        .support-section {
            background: #f5f5f5;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .support-title {
            font-size: 17px;
            color: #764ba2;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .support-list {
            list-style: none;
        }
        .support-list li {
            padding: 10px 0;
            color: #555;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            line-height: 1.6;
        }
        .support-list li:last-child {
            border-bottom: none;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #eee;
            font-size: 12px;
            color: #999;
        }
        .footer-brand {
            font-size: 16px;
            font-weight: 700;
            color: #8B5CF6;
            margin-bottom: 8px;
        }
        .footer-text {
            margin: 5px 0;
            font-size: 12px;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 5px;
            color: #8B5CF6;
            text-decoration: none;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">🛡️</div>
                <div class="brand-name">Cybersec-Arena</div>
                <div class="tagline">Interactive Cybersecurity Learning Platform</div>
            </div>

            <!-- Body Content -->
            <div class="body-content">
                <!-- Greeting with Name -->
                <div class="greeting">
                    Hi <span class="greeting-name">{{ user_metadata.name || 'there' }}</span>! 👋
                </div>

                <!-- Welcome Section -->
                <div class="welcome-section">
                    <div class="welcome-title">🎯 Welcome to Cybersec-Arena!</div>
                    <div class="welcome-text">
                        We're thrilled to have you join our community of cybersecurity enthusiasts! You're about to embark on an exciting journey to master cybersecurity skills through hands-on challenges and real-world scenarios.
                    </div>
                    <div class="welcome-text" style="font-weight: 600; color: #764ba2;">
                        Access to premium features:
                    </div>
                    <ul class="features-list">
                        <li><span class="feature-icon">🔐</span><strong>50+ CTF Challenges</strong> - Cryptography, Web, Forensics & more</li>
                        <li><span class="feature-icon">📧</span><strong>Phishing Hunt</strong> - Learn to identify malicious emails</li>
                        <li><span class="feature-icon">💻</span><strong>Code Security</strong> - Fix vulnerable code patterns</li>
                        <li><span class="feature-icon">🧠</span><strong>Cyber Quiz</strong> - Test your security knowledge</li>
                        <li><span class="feature-icon">📡</span><strong>Threat Radar</strong> - Analyze cyber threats</li>
                        <li><span class="feature-icon">🏆</span><strong>Global Leaderboard</strong> - Compete with other learners</li>
                    </ul>
                </div>

                <!-- Security Note -->
                <div class="security-note">
                    🔒 <strong>Email Verification:</strong> We need to verify your email address to secure your account and prevent unauthorized access. This is a one-time process.
                </div>

                <!-- Call-to-Action -->
                <div class="cta-section">
                    <div class="cta-title">🔐 Confirm Your Email Address</div>
                    <a href="{{ confirmation_link }}" class="cta-button">Verify Email Now</a>
                    <div class="expiry-note">⏰ This link expires in 24 hours</div>
                    <div class="alt-link">
                        Or copy and paste this link in your browser:<br><br>
                        {{ confirmation_link }}
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="steps-section">
                    <div class="steps-title">📋 Your Next Steps</div>
                    <ol class="steps-list">
                        <li>Click the button above to verify your email address</li>
                        <li>Return to login and sign in with your credentials</li>
                        <li>Complete your profile and set your preferences</li>
                        <li>Choose your first challenge and start learning! 🚀</li>
                    </ol>
                </div>

                <!-- Support Section -->
                <div class="support-section">
                    <div class="support-title">💡 Need Help?</div>
                    <ul class="support-list">
                        <li><strong>❌ Email didn't confirm?</strong> Check your spam/junk folder. If not there, you can request a new confirmation email after logging in</li>
                        <li><strong>⏰ Link expired?</strong> No problem! You can request a new verification link anytime from the login page</li>
                        <li><strong>❓ Account issues?</strong> Our support team is here to help at support@cybersec-arena.com</li>
                        <li><strong>🚀 Getting started?</strong> Visit our tutorials and documentation to learn the platform</li>
                    </ul>
                </div>

                <!-- Security Warning -->
                <div class="warning-note">
                    ⚠️ <strong>Security Notice:</strong> If you didn't create this account, please ignore this email immediately. Your email address is never shared with third parties, and we take your privacy seriously. Never share your password with anyone.
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-brand">Cybersec-Arena</div>
                <div class="footer-text">Interactive Cybersecurity Learning Platform</div>
                <div class="footer-text">Master cybersecurity skills through hands-on challenges</div>
                <div class="social-links">
                    <a href="https://cybersec-arena.com">Visit Website</a> | 
                    <a href="https://cybersec-arena.com/support">Support Center</a> |
                    <a href="https://cybersec-arena.com/privacy">Privacy Policy</a>
                </div>
                <div class="footer-text" style="margin-top: 15px; opacity: 0.7;">
                    © 2024 Cybersec-Arena. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
            <p style="margin: 10px 0; color: #aaa;">
                © 2025 Cybersec-Arena. All rights reserved.<br>
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
```

#### Step 4: Save the Template

1. Click the **"Save"** button
2. You'll see a confirmation message

#### Step 5: Test the Email Template

1. Scroll down to **"Test email template"** section
2. Enter a test email address (your email)
3. Click **"Send test email"**
4. Check your inbox for the test email
5. Verify it displays correctly with all formatting
6. Test that the confirmation link works

#### Step 6: Test Full Signup Flow

1. Go to your app at `http://localhost:5173` (or your production URL)
2. Click **"Sign up"**
3. Fill in the signup form with test data
4. Click **"Create Account"**
5. Check your email for the confirmation message
6. Click the **"Verify Email Now"** button
7. Verify email is confirmed successfully
8. Log in with your test account
9. Confirm you can access the dashboard

#### Template Variables Used

| Variable | Purpose |
|----------|---------|
| `{{ confirmation_link }}` | Full confirmation URL with token |
| `{{ user_metadata.name }}` | User's name from signup |
| `{{ email }}` | User's email address |

**Note**: Ensure Supabase can access these variables. If they're not available, the template will fall back to default values.

### 6. Enable Email Confirmation

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure:
   - **Enable email confirmations** is checked
   - **Secure email change** is enabled (recommended)

### 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check your email for the confirmation link
4. Click the confirmation link
5. Try logging in

**Note**: For step-by-step instructions on implementing the custom email template, see `EMAIL_TEMPLATE_IMPLEMENTATION_GUIDE.md` in the project root.

## Database Schema Overview

### Tables

1. **user_profiles**
   - Stores user profile information (username, name, email, avatar, bio)
   - Linked to Supabase Auth users

2. **user_progress**
   - Stores game progress (CTF, Phish Hunt, Code & Secure, Quiz, Firewall)
   - Tracks badges and scores

3. **leaderboard_scores**
   - Stores leaderboard entries
   - Aggregated scores for ranking

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Leaderboard is publicly readable by authenticated users
- All policies are defined in the schema

### Automatic Features

- **Auto-create profile**: When a user signs up, their profile and progress are automatically created
- **Auto-update timestamps**: `updated_at` fields are automatically updated
- **Username sync**: Leaderboard username is automatically synced when profile username changes

## Troubleshooting

### Issue: "Supabase is not configured" error

**Solution:** Make sure your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### Issue: Email confirmation not working

**Solution:**
1. Check that email confirmations are enabled in Supabase settings
2. Verify the redirect URL is correctly configured
3. Check your spam folder
4. Ensure the email template is properly configured

### Issue: "Permission denied" errors

**Solution:**
1. Verify RLS policies are created correctly
2. Check that the user is authenticated
3. Ensure the user's email is confirmed

### Issue: Tables not found

**Solution:**
1. Make sure you ran the entire `schema.sql` file
2. Check the SQL Editor for any errors
3. Verify tables exist in **Table Editor**

## Production Checklist

Before deploying to production:

- [ ] Update environment variables with production Supabase credentials
- [ ] Configure production redirect URLs
- [ ] Set up custom email domain (optional)
- [ ] Review and test RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting (if needed)
- [ ] Test email delivery

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

