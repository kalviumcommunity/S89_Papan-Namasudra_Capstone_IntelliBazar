# Email Setup Guide for IntelliBazar

This guide explains how to set up email functionality for password reset features in IntelliBazar.

## Option 1: Gmail Setup (Recommended for small projects)

### Prerequisites
- A Gmail account
- 2-Factor Authentication enabled on your Gmail account

### Steps:

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Follow the setup process if not already enabled

2. **Generate App Password**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Scroll down to "App passwords"
   - Select "Mail" and your device/app name
   - Copy the 16-character password generated

3. **Update .env file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=IntelliBazar <your-email@gmail.com>
   ```

4. **Test the setup**
   - Restart your server
   - Try the forgot password functionality
   - Check your Gmail sent folder for the email

## Option 2: Other Email Services

### SendGrid (Recommended for production)
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=IntelliBazar <noreply@yourdomain.com>
```

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
EMAIL_FROM=IntelliBazar <your-email@outlook.com>
```

### Custom SMTP
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
EMAIL_FROM=IntelliBazar <your-email@yourdomain.com>
```

## Option 3: Development Mode

For development and testing, the system will automatically use Ethereal Email (fake SMTP service):

```env
# Leave these commented out for development
# EMAIL_SERVICE=
# EMAIL_USER=
# EMAIL_PASS=
```

The system will create temporary test accounts and log the preview URLs to the console.

## Troubleshooting

### Common Issues:

1. **"Invalid login" error with Gmail**
   - Make sure 2FA is enabled
   - Use App Password, not your regular Gmail password
   - Check that the email address is correct

2. **"Connection refused" error**
   - Check your internet connection
   - Verify the email service settings
   - Some networks block SMTP ports

3. **Emails not being received**
   - Check spam/junk folder
   - Verify the recipient email address
   - Check server logs for errors

### Testing Email Setup

You can test your email configuration by:

1. Using the forgot password feature in the app
2. Checking server logs for email sending status
3. Looking for preview URLs in development mode

### Security Notes

- Never commit your .env file to version control
- Use App Passwords instead of regular passwords
- Consider using dedicated email services for production
- Regularly rotate your email credentials

## Production Recommendations

For production applications, consider:

1. **Dedicated Email Service**: Use services like SendGrid, AWS SES, or Mailgun
2. **Domain Email**: Use your own domain for professional appearance
3. **Email Templates**: Create branded HTML email templates
4. **Rate Limiting**: Implement rate limiting for password reset requests
5. **Monitoring**: Set up email delivery monitoring and alerts

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_SERVICE` | Email service provider | `gmail`, `sendgrid`, `hotmail` |
| `EMAIL_USER` | Email username/API key | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/API key | `your-app-password` |
| `EMAIL_FROM` | From address for emails | `IntelliBazar <noreply@yourdomain.com>` |
| `EMAIL_HOST` | SMTP host (for custom SMTP) | `smtp.yourdomain.com` |
| `EMAIL_PORT` | SMTP port (for custom SMTP) | `587` |
| `EMAIL_SECURE` | Use SSL/TLS (for custom SMTP) | `true` or `false` |
