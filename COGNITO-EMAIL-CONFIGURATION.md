# AWS Cognito Email Configuration Guide

## Why You're Not Receiving Emails

Even with `email_verified = true`, AWS Cognito needs proper email configuration to send password reset codes. Here's what needs to be configured:

---

## Issue: Cognito Email Not Configured Properly

### Two Email Options in Cognito:

1. **Default Cognito Email (Limited)**
   - Free, built-in
   - Limited to 50 emails/day
   - Often goes to spam
   - FROM: `no-reply@verificationemail.com`
   - May require additional setup

2. **Amazon SES (Recommended for Production)**
   - Higher limits (starts at 200/day, can request more)
   - Custom FROM address
   - Better deliverability
   - Requires verification

---

## Check Current Email Configuration

### Step 1: Check Cognito Email Settings

1. Go to AWS Cognito Console: https://console.aws.amazon.com/cognito
2. Select region: **ap-southeast-2 (Sydney)**
3. Click on your user pool: `anmc-member-pool`
4. Click **"Messaging"** tab in left sidebar
5. Look at **"Email"** section

**What you should see:**

### Option A: Using Cognito Default Email
```
Email provider: Cognito default
Email sending account: [Cognito default]
Daily email limit: 50
FROM email address: no-reply@verificationemail.com
```

**If this is selected but emails aren't working:**
- Cognito default may require verification
- Check if you've hit the 50 email/day limit
- Emails often go to spam

### Option B: Using Amazon SES
```
Email provider: Amazon SES
FROM email address: noreply@anmc.org.au
Configuration set: (optional)
```

**If this is selected but emails aren't working:**
- SES email must be verified
- Account may be in SES Sandbox mode
- Need to verify recipient email in SES

---

## Solution 1: Verify Cognito Can Send Emails

### Check Email Settings:

**1. Go to User Pool → Messaging → Email**

**2. Check Configuration Type:**
- If "No email configuration" → **This is the problem!**
- Need to configure email provider

**3. If "Cognito default" is selected:**
- Check "FROM email address"
- Should be: `no-reply@verificationemail.com` (Cognito's default)
- If blank or different → Need to set it

**4. If using Cognito default, verify limits:**
- Daily limit: 50 emails
- Monthly limit: varies by account age
- Check if limit is reached

---

## Solution 2: Configure Cognito Default Email (Quick Fix)

### Step-by-Step Configuration:

**1. Go to Cognito User Pool → Messaging**

**2. Click "Edit" on Email section**

**3. Select Email Configuration:**
- Email provider: **Send email with Cognito**
- FROM email address: `no-reply@verificationemail.com`
- (This is Cognito's verified default sender)

**4. FROM email address ARN:**
- Leave blank (Cognito default doesn't use ARN)

**5. Reply-to email address (optional):**
- Can add: `support@anmc.org.au`
- This shows where users can reply

**6. Click "Save changes"**

**7. Test:**
- Try forgot password flow again
- Check email (including spam folder)
- Wait 2-3 minutes

---

## Solution 3: Configure Amazon SES (Production Solution)

Amazon SES provides better email delivery but requires setup.

### Part A: Verify Email in SES

**1. Go to Amazon SES Console:**
https://console.aws.amazon.com/ses

**2. Select Same Region:**
- **IMPORTANT:** Must be same region as Cognito
- Select: **ap-southeast-2 (Sydney)**

**3. Verify an Email Address:**

**Option 1: Verify Individual Email (Quick - For Testing)**
- Left sidebar → **Verified identities**
- Click **"Create identity"**
- Identity type: **Email address**
- Email address: `noreply@anmc.org.au` (or your email)
- Click **"Create identity"**
- Check your email inbox
- Click verification link in email
- Status changes to "Verified" ✅

**Option 2: Verify Domain (Better - For Production)**
- Left sidebar → **Verified identities**
- Click **"Create identity"**
- Identity type: **Domain**
- Domain: `anmc.org.au`
- Follow DNS verification steps
- Add DKIM records to domain
- Wait for verification (can take up to 72 hours)

### Part B: Check SES Sandbox Status

**By default, SES is in "Sandbox mode":**
- Can only send to verified email addresses
- Limited to 200 emails/day
- Cannot send to public

**Check if in Sandbox:**
1. SES Console → **Account dashboard**
2. Look for banner: "Your Amazon SES account is in the sandbox"

**To Request Production Access:**
1. SES Console → **Account dashboard**
2. Click **"Request production access"**
3. Fill out form:
   - Mail type: **Transactional** (password resets, etc.)
   - Website URL: `https://anmc.org.au`
   - Use case description:
     ```
     Sending transactional emails for ANMC member portal:
     - Password reset verification codes
     - Email verification codes
     - Account notifications
     Expected volume: ~100 emails/day
     ```
4. Submit request
5. AWS typically approves within 24 hours

### Part C: Configure Cognito to Use SES

**1. Go to Cognito User Pool → Messaging → Email**

**2. Click "Edit"**

**3. Email Configuration:**
- Email provider: **Send email with Amazon SES**
- SES Region: **ap-southeast-2**
- FROM email address: `noreply@anmc.org.au`
  - Must be verified in SES
- Configuration set name: (leave blank for now)
- Reply-to email address: `support@anmc.org.au` (optional)

**4. Click "Save changes"**

**5. Test:**
- Try forgot password flow
- Check email inbox
- Should receive email from `noreply@anmc.org.au`

---

## Solution 4: Test Configuration with AWS CLI

You can test if email sending works:

### Test Forgot Password Email:

```bash
aws cognito-idp forgot-password \
  --client-id 2h0bk9340rlmevdnsof7ml31ai \
  --username member@anmc.org.au \
  --region ap-southeast-2
```

**Expected Response if Working:**
```json
{
    "CodeDeliveryDetails": {
        "Destination": "m***@a***",
        "DeliveryMedium": "EMAIL",
        "AttributeName": "email"
    }
}
```

**This means:**
- ✅ Email was sent successfully
- Check your inbox (and spam folder)
- Code was delivered to email

**If Error:**
```
An error occurred (InvalidParameterException) when calling the ForgotPassword operation
```
- Email configuration is not set up
- Follow solutions above

---

## Common Issues and Fixes

### Issue 1: "Email provider not configured"

**Cause:** No email provider selected in Cognito

**Fix:**
1. Cognito → User Pool → Messaging → Email
2. Click "Edit"
3. Select "Send email with Cognito" or "Send email with Amazon SES"
4. Save

### Issue 2: "Email not verified in SES"

**Cause:** Using SES but email address not verified

**Fix:**
1. Go to SES Console → Verified identities
2. Verify the FROM email address
3. Click verification link in email
4. Wait for "Verified" status
5. Then retry in Cognito

### Issue 3: "SES sandbox - cannot send to recipient"

**Cause:** SES in sandbox mode, recipient email not verified

**Fix (Quick - For Testing):**
1. SES → Verified identities
2. Verify recipient email (member@anmc.org.au)
3. Click verification link
4. Now can send to that email

**Fix (Proper - For Production):**
1. Request production access (see above)
2. Wait for approval (~24 hours)
3. Can send to any email

### Issue 4: "Daily sending quota exceeded"

**Cause:** Hit email limit (50 for Cognito default, 200 for SES sandbox)

**Fix:**
1. Wait until tomorrow (resets at midnight UTC)
2. Or request higher limit in SES
3. Or request production access

### Issue 5: Emails going to spam

**Cause:** Using Cognito default or SES without SPF/DKIM

**Fix:**
1. Use SES (better deliverability)
2. Verify domain (not just email)
3. Configure SPF and DKIM records
4. Request production access

---

## Quick Checklist - Why Emails Aren't Being Sent

### In Cognito Console:
- [ ] User pool exists
- [ ] User email_verified = true
- [ ] Messaging → Email is configured
- [ ] Email provider is selected (Cognito or SES)
- [ ] FROM email address is set
- [ ] Not at daily limit (50 for Cognito)

### If Using SES:
- [ ] SES is in same region (ap-southeast-2)
- [ ] FROM email verified in SES
- [ ] If sandbox mode: recipient email verified
- [ ] Or: Production access requested/approved

### Test:
- [ ] Run AWS CLI test command
- [ ] Check response for CodeDeliveryDetails
- [ ] Check email inbox (and spam)
- [ ] Wait 2-3 minutes

---

## Recommended Setup (Step by Step)

### For Immediate Testing (5 minutes):

**Option A: Use Cognito Default**
1. Cognito → Messaging → Edit
2. Select "Send email with Cognito"
3. FROM: `no-reply@verificationemail.com`
4. Save
5. Test forgot password
6. Check spam folder

**Option B: Verify Email in SES**
1. SES Console → Create identity → Email
2. Enter: `noreply@anmc.org.au`
3. Check inbox and click verification link
4. Cognito → Messaging → Edit
5. Select "Send email with Amazon SES"
6. FROM: `noreply@anmc.org.au`
7. Save
8. Test forgot password

### For Production (1-2 days):

1. ✅ Verify domain in SES (`anmc.org.au`)
2. ✅ Configure DKIM records
3. ✅ Request production access
4. ✅ Wait for approval
5. ✅ Configure Cognito to use SES
6. ✅ Customize email templates
7. ✅ Test thoroughly

---

## Email Template Customization (Optional)

You can customize the password reset email:

**1. Cognito → Messaging → Message templates**

**2. Verification type: Forgot password**

**3. Customize email:**
```
Subject: Reset Your ANMC Password

Hello,

You requested to reset your password for your ANMC member account.

Your verification code is: {####}

This code will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
ANMC Team
```

**4. Save changes**

---

## What I Recommend Right Now

### Immediate Action (Choose One):

**Option 1: Quick Test with Cognito Default**
1. Go to Cognito → Messaging → Email
2. Configure "Send email with Cognito"
3. Test forgot password flow
4. Emails may go to spam but will work

**Option 2: Use SES (Better)**
1. Go to SES → Verify email: `noreply@anmc.org.au`
2. Click verification link in email
3. Verify recipient email in SES: `member@anmc.org.au`
4. Click verification link
5. Configure Cognito to use SES
6. Test - should work immediately

### What Would You Like Me to Help With?

- **A)** Walk through Cognito email configuration (Option 1 - Quick)
- **B)** Walk through SES setup (Option 2 - Better)
- **C)** Create a workaround (set password via CLI)
- **D)** All of the above

Let me know and I can guide you step-by-step!
