const nodemailer = require('nodemailer');

const ZOHO_MAIL = 'us@aiautomationonline.de';
const ZOHO_APP_PASSWORD = 'TQ+utU%TANS9gSmY';

const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.eu',
    port: 465,
    secure: true,
    auth: {
        user: ZOHO_MAIL,
        pass: ZOHO_APP_PASSWORD
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
//     to: ['milton.segundo@aiautomationonline.de', 'info@aiautomationonline.de'],
//     from: ZOHO_MAIL,
//     replyTo: ['milton.segundo@aiautomationonline.de'],
//     subject: 'Test Email',
//     text: 'Hello!',
//     html: '<h1>Hello</h1>',
// });

module.exports.sendTestEmail = async ({subject, text, html, replyTo}) => {
    let ret = {success: false, error: "noninitialized"}
    try {
        ret = await sendEmailInternal({
            to: ['milton.segundo@aiautomationonline.de', 'kevin@aiautomationonline.de'],
            from: ZOHO_MAIL,
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