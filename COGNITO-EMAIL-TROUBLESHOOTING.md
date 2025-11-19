# AWS Cognito Email Verification Code - Troubleshooting Guide

## Problem: Not Receiving Verification Code Email

If you're not receiving the verification code email, there are several common reasons and solutions.

---

## Quick Diagnostic Checklist

### 1. Check Spam/Junk Folder
- ✅ **First thing to check!**
- Cognito emails often go to spam
- Look for email from: `no-reply@verificationemail.com`
- Subject: "Your verification code"
- If found, mark as "Not Spam"

### 2. Check Email Address in Cognito
1. Go to AWS Cognito Console: https://console.aws.amazon.com/cognito
2. Select your user pool
3. Click "Users" tab
4. Find your user
5. Check:
   - Email address is correct
   - Email verification status is "true" ✅
   - If "false" ❌ - emails won't be sent

### 3. Check Cognito Email Configuration
1. In your user pool, click "Messaging" tab
2. Check "Email" section:
   - Should show "Amazon Cognito" or "Amazon SES"
   - If using Cognito default: Limited to 50 emails/day
   - Daily limit may be reached

---

## Solution 1: Verify Email Address in Cognito (Most Common Issue)

### Check if Email is Verified:

**Via AWS Console:**
1. AWS Cognito Console → Your User Pool
2. Click "Users" → Select your user
3. Look at "Email verified" attribute
4. If it shows "false", the email is NOT verified

**Why this matters:**
- Cognito will NOT send verification codes to unverified emails
- This is a security feature

### How to Verify Email:

**Method A: Via AWS Console (Easiest)**
1. Go to your user in Cognito
2. Click "Edit" or "Actions" → "Edit attributes"
3. Find "email_verified" attribute
4. Change to "true" ✅
5. Save

**Method B: Via AWS CLI**
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --user-attributes Name=email_verified,Value=true \
  --region ap-southeast-2
```

---

## Solution 2: Get Verification Code from AWS Console (Testing)

For testing purposes, you can see the verification code in AWS:

### Method A: CloudWatch Logs (If Enabled)
1. Go to CloudWatch Console
2. Log Groups → `/aws/cognito/userpools/ap-southeast-2_egMmxcO1M`
3. Search for recent logs
4. Look for "forgotPassword" event
5. Code will be in the log entry

### Method B: Admin Reset (Shows Code in Console)
1. Go to Cognito User Pool
2. Select user
3. Actions → "Reset password"
4. AWS may show the temporary password/code in console
5. Use this for testing

---

## Solution 3: Use Admin Set Password (Bypass Verification)

Instead of email verification, admin can directly set password:

### Via AWS Console:
1. Cognito → User Pool → Users
2. Select user
3. Actions → "Reset password"
4. Set new password directly
5. User can login immediately

### Via AWS CLI:
```bash
# Set password directly without email
aws cognito-idp admin-set-user-password \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --password "NewPassword123!" \
  --permanent \
  --region ap-southeast-2
```

**This bypasses email completely!**

---

## Solution 4: Configure Amazon SES (Production Solution)

For reliable email delivery, configure Amazon SES:

### Why SES is Better:
- Higher email limits (50,000+ per day)
- Better deliverability
- Custom FROM address
- Doesn't go to spam as often
- Production-ready

### Setup Steps:

**1. Verify Email Address in SES:**
```bash
aws ses verify-email-identity \
  --email-address noreply@anmcinc.org.au \
  --region ap-southeast-2
```

**2. Check Verification Email:**
- AWS sends verification email to `noreply@anmcinc.org.au`
- Click the verification link

**3. Configure Cognito to Use SES:**
1. Cognito → User Pool → Messaging
2. Email → Configure with Amazon SES
3. Select verified email
4. FROM address: `noreply@anmcinc.org.au`
5. Reply-to: `support@anmcinc.org.au` (optional)
6. Save changes

**4. Request Production Access:**
- By default, SES is in "Sandbox mode"
- Can only send to verified emails
- Request production access: AWS Console → SES → Account dashboard → Request production access

---

## Solution 5: Development Workaround - Disable Email Verification

For development/testing only:

### Create Test Password Change Function

I can create a development-only password change page that doesn't require email verification:

**Features:**
- Direct password change (no email code)
- Requires old password
- Only works when logged in
- Bypasses Cognito email flow

**Would you like me to implement this?**

---

## Solution 6: Check AWS Account Limits

### Email Sending Limits:

**Cognito Default Email:**
- 50 emails per day per User Pool
- May be less for new AWS accounts
- Counter resets at midnight UTC

**Check if limit reached:**
1. AWS Cognito Console
2. Your User Pool → Monitoring tab
3. Check "Email sent" metric
4. If at 50/50 → wait until tomorrow or configure SES

---

## Immediate Testing Solution (Recommended)

### Use Admin Set Password for Now:

**Step 1: Open AWS CLI or CloudShell**

**Step 2: Run this command:**
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --password "TestPassword123!" \
  --permanent \
  --region ap-southeast-2
```

**Step 3: Test Login:**
- Go to: http://localhost:3036/login
- Email: `member@anmcinc.org.au`
- Password: `TestPassword123!`
- Should work immediately!

**This completely bypasses the email verification process.**

---

## Long-term Solutions (Priority Order)

### 1. Immediate (Testing):
✅ Use `admin-set-user-password` CLI command
- No email needed
- Instant password change
- Perfect for testing

### 2. Short-term (Development):
✅ Verify email address in Cognito console
✅ Check spam folder
✅ Ensure email_verified = true

### 3. Long-term (Production):
✅ Configure Amazon SES
✅ Verify custom domain
✅ Request production access
✅ Custom email templates

---

## Testing Checklist

**Before requesting password reset:**
- [ ] User exists in Cognito
- [ ] Email address is correct
- [ ] `email_verified` = true
- [ ] Not at daily email limit (50)
- [ ] Check spam/junk folder
- [ ] Wait 2-3 minutes for email

**If still no email:**
- [ ] Use admin-set-password CLI command
- [ ] Or verify email in Cognito console
- [ ] Or configure SES for production

---

## Quick Commands Reference

### Check User Details:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --region ap-southeast-2
```

### Verify Email:
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --user-attributes Name=email_verified,Value=true \
  --region ap-southeast-2
```

### Set Password Directly:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --password "YourNewPassword123!" \
  --permanent \
  --region ap-southeast-2
```

### Resend Verification Code (Triggers Email):
```bash
aws cognito-idp admin-reset-user-password \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmcinc.org.au \
  --region ap-southeast-2
```

---

## Common Error Messages

### "Cannot reset password for user as there is no registered/verified email"
**Cause:** Email not verified in Cognito
**Solution:** Set `email_verified = true` in user attributes

### "User does not exist"
**Cause:** Wrong email or user not created
**Solution:** Verify user exists in Cognito console

### "Limit exceeded"
**Cause:** Daily email limit reached (50 emails)
**Solution:** Wait until tomorrow or configure SES

### "Invalid parameter: Cannot deliver to email address"
**Cause:** Email address format invalid or doesn't exist
**Solution:** Check email address is correct

---

## What I Recommend Right Now

### For Testing (Now):
1. **Use AWS CLI to set password directly:**
   ```bash
   aws cognito-idp admin-set-user-password \
     --user-pool-id ap-southeast-2_egMmxcO1M \
     --username member@anmcinc.org.au \
     --password "NewTest123!" \
     --permanent \
     --region ap-southeast-2
   ```

2. **Then login immediately** - no email needed!

### For Development (This Week):
1. Verify email address in Cognito console
2. Test forgot password flow again
3. Check spam folder thoroughly

### For Production (Before Launch):
1. Configure Amazon SES
2. Verify domain (anmcinc.org.au)
3. Request production access
4. Customize email templates
5. Test thoroughly

---

## Need Help?

**If you're still stuck, let me know:**
1. Are you using AWS CLI or Console?
2. What's the user email address?
3. Have you checked Cognito user attributes?
4. Is email_verified = true?
5. Do you want me to create a workaround?

**I can help you:**
- ✅ Set password via CLI
- ✅ Verify email address
- ✅ Create development password change page
- ✅ Configure SES step-by-step
- ✅ Debug specific error messages
