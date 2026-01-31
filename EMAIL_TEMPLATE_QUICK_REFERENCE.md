# ⚡ Email Template Implementation - Quick Reference

## 5-Minute Setup

### 1️⃣ Access Supabase
- Go to https://supabase.com
- Login → Select Cybersec-Arena project
- Click **Authentication** → **Email Templates**

### 2️⃣ Edit "Confirm signup" Template

**Subject Line:**
```
Confirm Your Email to Activate Your Cybersec-Arena Account
```

**Body:** 
- Open `supabase/README.md`
- Find section: "### 5. Configure Custom Email Templates"
- Copy the entire HTML code block (starts with `<!DOCTYPE html>`)
- Paste into Supabase template body

### 3️⃣ Save Template
- Click **Save** button
- Wait for success message

### 4️⃣ Send Test Email
- Scroll to "Test email template"
- Enter your test email
- Click **Send test email**
- Check inbox for test email

### 5️⃣ Test Full Flow
```
1. Go to http://localhost:5173
2. Click Sign up
3. Fill form & create account
4. Check email for confirmation
5. Click confirmation link
6. Login with your account
```

---

## Template Content Preview

### Email Subject
✉️ `Confirm Your Email to Activate Your Cybersec-Arena Account`

### Email Greeting
👋 `Hi {{name}},`

### Email Features
- 🛡️ Cybersec-Arena header
- 📋 6 platform features listed
- 🔐 Purple CTA button ("Verify Email Now")
- ✅ What's Next section
- 💬 Support information
- ⚠️ Security warning

### Email Footer
```
© 2025 Cybersec-Arena. All rights reserved.
Interactive Cybersecurity Learning Platform
```

---

## What Gets Customized

| Element | Current | Custom |
|---------|---------|--------|
| Subject | Default | "Confirm Your Email to Activate..." |
| Header | Generic | 🛡️ Cybersec-Arena branded |
| Greeting | Generic | Hi {{name}}, Welcome 👋 |
| Content | Generic | Platform-specific features |
| Button | Generic | Purple "Verify Email Now" |
| Footer | Generic | Cybersec-Arena branded |

---

## Key Variables in Template

```
{{ confirmation_link }}     → User's email confirmation link
{{ user_metadata.name }}    → User's name from signup
{{ email }}                 → User's email address
```

⚠️ Keep these exactly as shown - they're Supabase variables!

---

## Verification Checklist

After implementation, verify:

- [ ] Subject line updated
- [ ] Email body updated with custom HTML
- [ ] All variables present: `{{ confirmation_link }}`
- [ ] Test email sends successfully
- [ ] Test email displays correctly
- [ ] Full signup → confirm → login flow works
- [ ] Email looks good on mobile
- [ ] Support email in footer is correct

---

## Testing Emails

### Test 1: Template Test Email
```
Supabase → Email Templates → Test email template
→ Send test email to your address
→ Verify formatting
```

### Test 2: Development Signup
```
1. npm run dev
2. Go to http://localhost:5173/signup
3. Create test account
4. Check email for confirmation
5. Click confirmation link
6. Verify success
7. Login with account
```

### Test 3: Resend Flow
```
1. Go to login page
2. Try resending confirmation
3. Verify new email arrives
4. Click link from new email
5. Verify confirmation works
```

---

## File Locations

| File | Purpose |
|------|---------|
| `supabase/README.md` | Custom template HTML code |
| `EMAIL_TEMPLATE_IMPLEMENTATION_GUIDE.md` | Detailed setup instructions |
| `EMAIL_TEMPLATE_CUSTOMIZATION.md` | Full documentation & customization |

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Email not arriving | Check spam folder, verify email provider enabled |
| Template won't save | Check HTML syntax, verify variables intact |
| Link doesn't work | Verify URL Configuration in Supabase Settings |
| Email looks broken | Try plain text version, test in multiple clients |
| Wrong colors | HTML may use `#8B5CF6` - adjust if needed |

---

## Production Checklist

Before deploying to production:

- [ ] Test email template works
- [ ] Update production URL in Supabase
- [ ] Update redirect URLs (change localhost to domain)
- [ ] Test signup on production
- [ ] Monitor email delivery
- [ ] Update support email in footer
- [ ] Monitor user feedback

---

## Revert to Default

If you need to revert to Supabase default email:

1. Go to **Authentication** → **Email Templates**
2. Click **"Confirm signup"**
3. Click **"Reset to default"** button
4. Confirm reset

---

## Need More Help?

- 📖 Full docs: See `EMAIL_TEMPLATE_CUSTOMIZATION.md`
- 🚀 Setup guide: See `EMAIL_TEMPLATE_IMPLEMENTATION_GUIDE.md`
- 🔧 Backend code: Check `src/services/authService.ts`
- ❓ Supabase docs: https://supabase.com/docs/guides/auth

