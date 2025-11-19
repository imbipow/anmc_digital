# AWS Cognito Setup Guide - Step by Step

## Why You Don't See Users in Cognito

Currently, the app is using **fallback authentication** because:
- No `.env` file exists (only `.env.example`)
- No Cognito credentials configured
- System automatically uses local test credentials

To see actual users in AWS Cognito, you need to:
1. Create a Cognito User Pool
2. Configure environment variables
3. Create users in Cognito

---

## Step 1: Create AWS Cognito User Pool

### 1.1 Access AWS Cognito Console

1. Log in to AWS Console: https://console.aws.amazon.com
2. Select region: **ap-southeast-2 (Sydney)**
3. Search for "Cognito" and click on it
4. Click **"Create user pool"**

### 1.2 Configure Sign-in Experience

**Step 1 of 6: Configure sign-in experience**

- **Provider types:** Select "Cognito user pool"
- **Cognito user pool sign-in options:**
  - ✅ Email
  - ❌ Phone number
  - ❌ Username
- Click **"Next"**

### 1.3 Configure Security Requirements

**Step 2 of 6: Configure security requirements**

**Password policy:**
- Select "Cognito defaults" or customize:
  - Minimum length: 8 characters
  - ✅ Contains uppercase letters
  - ✅ Contains lowercase letters
  - ✅ Contains numbers
  - ✅ Contains special characters

**Multi-factor authentication (MFA):**
- Select "No MFA" for development
- Select "Optional MFA" or "Require MFA" for production (recommended)

**User account recovery:**
- ✅ Enable self-service account recovery
- Recovery method: **Email only**

Click **"Next"**

### 1.4 Configure Sign-up Experience

**Step 3 of 6: Configure sign-up experience**

**Self-service sign-up:**
- ✅ Enable self-registration (allows users to sign up via your app)
- OR ❌ Disable if you want admin-only user creation

**Attribute verification and user account confirmation:**
- ✅ Allow Cognito to automatically send messages to verify and confirm
- Send email message, verify email address: ✅ Enabled

**Required attributes:**
- ✅ email (already selected)
- ✅ given_name (first name)
- ✅ family_name (last name)

**Custom attributes** - Add these for member data:
1. Click "Add custom attribute"
   - Name: `member_id`
   - Type: String
   - Min length: 1, Max length: 50
   - Mutable: ✅ Yes

2. Click "Add custom attribute"
   - Name: `membership_type`
   - Type: String
   - Min length: 1, Max length: 20
   - Mutable: ✅ Yes

3. Click "Add custom attribute"
   - Name: `membership_category`
   - Type: String
   - Min length: 1, Max length: 20
   - Mutable: ✅ Yes

4. Click "Add custom attribute"
   - Name: `join_date`
   - Type: String
   - Min length: 1, Max length: 20
   - Mutable: ✅ Yes

Click **"Next"**

### 1.5 Configure Message Delivery

**Step 4 of 6: Configure message delivery**

**Email:**
- Select "Send email with Cognito" (for development/testing)
- For production: "Send email with Amazon SES" (after SES setup)

**SES Region:** ap-southeast-2 (if using SES)

**FROM email address:**
- For Cognito email: `no-reply@verificationemail.com` (default)
- For SES: `noreply@anmcinc.org.au` (after verification)

Click **"Next"**

### 1.6 Integrate Your App

**Step 5 of 6: Integrate your app**

**User pool name:**
- Enter: `anmc-member-pool`

**Hosted authentication pages:**
- ❌ Don't use Cognito Hosted UI (we have custom login page)

**Domain:**
- Skip (not needed for custom UI)

**Initial app client:**
- App type: **Public client**
- App client name: `anmc-member-portal`
- Client secret: **Don't generate a client secret** ❌
  - ⚠️ IMPORTANT: Public clients can't use client secrets

**Advanced app client settings:**
- Authentication flows:
  - ✅ ALLOW_USER_PASSWORD_AUTH (required for our login)
  - ✅ ALLOW_REFRESH_TOKEN_AUTH (for session refresh)
  - ❌ ALLOW_CUSTOM_AUTH
  - ❌ ALLOW_USER_SRP_AUTH

Click **"Next"**

### 1.7 Review and Create

**Step 6 of 6: Review and create**

- Review all settings
- Click **"Create user pool"**

---

## Step 2: Get Your Cognito Credentials

After creating the user pool:

1. **Get User Pool ID:**
   - Click on your newly created pool
   - Copy the "User pool ID" (e.g., `ap-southeast-2_xxxxxxxxx`)

2. **Get App Client ID:**
   - In your user pool, click "App integration" tab
   - Scroll to "App clients and analytics"
   - Click on `anmc-member-portal`
   - Copy the "Client ID" (e.g., `1a2b3c4d5e6f7g8h9i0j1k2l3m`)

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

### 3.2 Update Cognito Settings in `.env`

Open `.env` and update these lines:

```env
# AWS Cognito Configuration
COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
REACT_APP_COGNITO_REGION=ap-southeast-2
```

Replace:
- `ap-southeast-2_xxxxxxxxx` with your actual User Pool ID
- `1a2b3c4d5e6f7g8h9i0j1k2l3m` with your actual Client ID

### 3.3 Restart Servers

After updating `.env`:

```bash
# Stop current servers (Ctrl+C)

# Restart frontend
npm start

# Restart backend (in new terminal)
cd api
npm run dev
```

---

## Step 4: Create Test User in Cognito

### Option A: Using AWS Console (Easiest)

1. **Go to your User Pool**
2. Click **"Users"** tab
3. Click **"Create user"**

**User information:**
- Email address: `member@anmcinc.org.au`
- ❌ Send an email invitation (for testing)
- ✅ Mark email address as verified

**Temporary password:**
- ✅ Set a password
- Password: `TempPassword123!`

**User attributes:**
Click "Add attribute" for each:
- `given_name`: `Test`
- `family_name`: `Member`
- `custom:member_id`: `ANMC-2024-TEST001`
- `custom:membership_type`: `general`
- `custom:membership_category`: `single`
- `custom:join_date`: `2024-01-01`

4. Click **"Create user"**

### Option B: Using AWS CLI

```bash
aws cognito-idp admin-create-user \
  --user-pool-id ap-southeast-2_xxxxxxxxx \
  --username member@anmcinc.org.au \
  --user-attributes \
    Name=email,Value=member@anmcinc.org.au \
    Name=email_verified,Value=true \
    Name=given_name,Value=Test \
    Name=family_name,Value=Member \
    Name=custom:member_id,Value=ANMC-2024-TEST001 \
    Name=custom:membership_type,Value=general \
    Name=custom:membership_category,Value=single \
    Name=custom:join_date,Value=2024-01-01 \
  --temporary-password "TempPassword123!" \
  --message-action SUPPRESS \
  --region ap-southeast-2
```

### Set Permanent Password

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id ap-southeast-2_xxxxxxxxx \
  --username member@anmcinc.org.au \
  --password "Member123!" \
  --permanent \
  --region ap-southeast-2
```

---

## Step 5: Create User Groups (Optional but Recommended)

### 5.1 In AWS Console

1. Go to your User Pool
2. Click **"Groups"** tab
3. Click **"Create group"**

**Create these groups:**

1. **GeneralMembers**
   - Group name: `GeneralMembers`
   - Description: `General membership tier`
   - Precedence: `2`

2. **LifeMembers**
   - Group name: `LifeMembers`
   - Description: `Life membership tier`
   - Precedence: `1`

3. **FamilyMembers**
   - Group name: `FamilyMembers`
   - Description: `Family membership type`
   - Precedence: `3`

### 5.2 Add User to Group

1. Go to **"Users"** tab
2. Click on `member@anmcinc.org.au`
3. Click **"Groups"** section
4. Click **"Add user to group"**
5. Select `GeneralMembers`
6. Click **"Add"**

---

## Step 6: Test the Integration

### 6.1 Verify Cognito is Configured

Check browser console when you open the app - you should NOT see:
```
⚠️ Cognito not configured, using fallback authentication
```


### 6.3 Check User in AWS

1. Go to Cognito Console
2. Click on your user pool
3. Click "Users" tab
4. You should see `member@anmcinc.org.au` listed
5. Click on the user to see all attributes

---

## Troubleshooting

### Issue: "User pool does not exist"

**Solution:**
- Verify User Pool ID in `.env` is correct
- Check region matches (ap-southeast-2)
- Restart frontend server after updating `.env`

### Issue: "Unable to verify secret hash for client"

**Solution:**
- You generated a client secret (don't do this for public clients)
- Create a new app client without client secret
- Update Client ID in `.env`

### Issue: "Password did not conform to policy"

**Solution:**
- Password must be at least 8 characters
- Must contain: uppercase, lowercase, number, special character

### Issue: Custom attributes not showing

**Solution:**
- Custom attributes can only be added when creating user pool
- If you already created pool without them, create a new pool
- Use format: `custom:attribute_name`

### Issue: Still using fallback authentication

**Solution:**
1. Check `.env` file exists (not just `.env.example`)
2. Verify all Cognito variables are set
3. Restart both frontend and backend servers
4. Clear browser cache and localStorage
5. Check browser console for error messages

---

## Cost Considerations

**AWS Cognito Pricing (as of 2024):**
- **Free Tier:** 50,000 Monthly Active Users (MAUs)
- **After Free Tier:** $0.0055 per MAU

For ANMC's member base, you'll likely stay within the free tier.

**Amazon SES (if used for emails):**
- Free: 62,000 emails/month (if sending from EC2)
- Or: $0.10 per 1,000 emails

---

## Security Best Practices

### Development
✅ Use temporary passwords for testing
✅ Keep test user email obvious (test@, member@)
✅ Use fallback auth for quick testing

### Production
⚠️ Enable MFA (Multi-Factor Authentication)
⚠️ Use Amazon SES for email
⚠️ Enable advanced security features
⚠️ Set up CloudWatch logging
⚠️ Configure password expiry
⚠️ Enable account takeover protection
⚠️ Use IAM roles instead of access keys

---

## Next Steps After Setup

1. ✅ Create Cognito User Pool
2. ✅ Configure `.env` file
3. ✅ Create test user
4. ✅ Test login flow
5. 🔜 Configure member registration to create Cognito users
6. 🔜 Set up email templates for password reset
7. 🔜 Enable MFA for production
8. 🔜 Configure Amazon SES for production emails

---

## Quick Reference
**User Pool Details:**
- Name: `anmc-member-pool`
- Region: `ap-southeast-2` (Sydney)
- App Client: `anmc-member-portal`

**Required Custom Attributes:**
- `custom:member_id`
- `custom:membership_type`
- `custom:membership_category`
- `custom:join_date`

**Environment Variables:**
```env
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
REACT_APP_COGNITO_REGION=ap-southeast-2
```

---

For more details, see [MEMBER-AUTHENTICATION.md](MEMBER-AUTHENTICATION.md)
