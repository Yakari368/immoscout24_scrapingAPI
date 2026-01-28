const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'test@test.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_PORT = process.env.SMTP_PORT || '465';
const SMTP_SECURE = process.env.SMTP_SECURE || 'off';
const SMTP_HOST = process.env.SMTP_HOST || ''

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number.parseInt(SMTP_PORT),
    secure: SMTP_SECURE === 'on',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
    }
});

async function sendEmailInternal({ to, from, replyTo, subject, text, html }) {
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    // Add replyTo if provided (can be string, array, or undefined)
    if (replyTo) {
        mailOptions.replyTo = replyTo;
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

// Usage with single reply-to
// sendEmail({
//     to: 'recipient@example.com',
//     subject: 'Test Email',
//     text: 'Hello!',
//     replyTo: 'support@yourdomain.com'
// });

// Usage with multiple reply-to addresses
// sendEmailInternal({
//     to: ['test@test1.com', 'test@test2.com'],
//     from: SMTP_USER,
//     replyTo: ['test@test1.com'],
//     subject: 'Test Email',
//     text: 'Hello!',
//     html: '<h1>Hello</h1>',
// });

module.exports.sendTestEmail = async ({subject, text, html, replyTo}) => {
    let ret = {success: false, error: "noninitialized"}
    try {
        ret = await sendEmailInternal({
            to: ['milton.segundo@aiautomationonline.de', 'kevin@aiautomationonline.de'],
            from: SMTP_USER,
            replyTo: [replyTo],
            subject,
            text,
            html,
        })
    } catch (err) {
        console.log(`Error sending test email 1 ${subject} ${text} ${replyTo}`)
        return 'failed'

    }
    if(!ret.success) {
        console.log(`Error sending test email 2 ${ret.error} ${subject} ${text} ${replyTo}`)
        return 'failed'
    }
    return 'success'

};