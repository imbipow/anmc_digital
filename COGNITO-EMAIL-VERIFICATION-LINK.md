# Configuring Cognito Email Verification with Links

## Issue
By default, AWS Cognito sends email verification **codes** instead of clickable **links**. When a member updates their email, they receive a code that must be manually entered.

## Solution: Configure Cognito User Pool

### Option 1: AWS Console Configuration (Recommended)

1. **Open AWS Cognito Console**
   - Go to AWS Console → Cognito → User Pools
   - Select your user pool: `anmc-members-pool`

2. **Navigate to Message Customizations**
   - Click on "Messaging" tab
   - Select "Message customizations"

3. **Configure Verification Email**
   - Under "Email verification message":
   - Change verification type from "Code" to **"Link"**
   - Customize the email template (optional):

```html
<p>Please click the link below to verify your email address:</p>
<p><a href="{##Verify Email##}">Verify Email</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{##Verify Email##}</p>
```

4. **Set Verification Link**
   - The link will redirect to: `https://yourdomain.com/verify-email`
   - Or use the default Cognito hosted UI

5. **Save Changes**

### Option 2: AWS CLI Configuration

```bash
aws cognito-idp update-user-pool \
  --user-pool-id YOUR_USER_POOL_ID \
  --email-verification-message "Please verify your email by clicking this link: {##Verify Email##}" \
  --email-verification-subject "Verify your ANMC email address" \
  --verification-message-template '{
    "DefaultEmailOption": "CONFIRM_WITH_LINK",
    "EmailMessage": "Please verify your email by clicking: {##Verify Email##}",
    "EmailSubject": "Verify your ANMC email"
  }'
```

### Option 3: CloudFormation/Terraform

If managing infrastructure as code:

**CloudFormation:**
```yaml
VerificationMessageTemplate:
  DefaultEmailOption: CONFIRM_WITH_LINK
  EmailMessage: "Please verify your email by clicking: {##Verify Email##}"
  EmailSubject: "Verify your ANMC email address"
```

**Terraform:**
```hcl
resource "aws_cognito_user_pool" "anmc_members" {
  verification_message_template {
    default_email_option = "CONFIRM_WITH_LINK"
    email_message        = "Please verify your email by clicking: {##Verify Email##}"
    email_subject        = "Verify your ANMC email address"
  }
}
```

## Current Workaround (Until Configured)

Until the Cognito User Pool is configured for links, users can verify their email using the code method:

1. **User receives verification code via email**
2. **Navigate to verification page** (needs to be created)
3. **Enter the verification code**
4. **Code submitted to Cognito for verification**

### Implementation of Code-Based Verification (Temporary)

If you want to support code-based verification while waiting for link configuration:

1. Create a verification page at `/verify-email`
2. User enters the code received via email
3. Call Cognito API to verify:

```javascript
// Frontend verification page
const verifyEmail = async (code) => {
  const response = await fetch('/api/members/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  // Handle response
};
```

## Recommended Approach

**Configure Cognito User Pool to use CONFIRM_WITH_LINK** - This is the cleanest solution and provides the best user experience.

After configuration:
- ✅ Users receive clickable verification links
- ✅ One-click verification process
- ✅ Better mobile experience
- ✅ Reduced support requests
- ✅ Professional email appearance

## Testing

After configuration, test by:
1. Updating a member's email address
2. Checking the email received
3. Clicking the verification link
4. Confirming email is verified in Cognito
