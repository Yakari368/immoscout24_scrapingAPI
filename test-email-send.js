const nodemailer = require('nodemailer');
const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0


const SMTP_USER = process.env.SMTP_USER || 'test@test.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_PORT = process.env.SMTP_PORT || '465';
const SMTP_SECURE = process.env.SMTP_SECURE || 'off';
const SMTP_HOST = process.env.SMTP_HOST || ''
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
});

const sendMailMailgun = async function ({ to, from, replyTo, subject, text, html }) {
  try {
    let mailOptions = {
      from: from,
      to: to,
      subject,
      text,
      html: html,
      'h:Content-Language': 'de-DE',
    };
    if (replyTo) {
        mailOptions['h:Reply-To'] = replyTo;
    }
    const data = await mg.messages.create(MAILGUN_DOMAIN, mailOptions);

    console.log(data); // logs response data
    return { success: true, messageId: JSON.stringify(data) };
  } catch (error) {
    console.log(error); //logs any error
    return { success: false, error: error };
  }
};

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
        ret = await sendMailMailgun({
                to: ['milton.segundo@aiautomationonline.de', 'kevin@aiautomationonline.de'],
                from: `Immoscout Setup <${MAILGUN_FROM}>`,
                replyTo: [replyTo],
                subject,
                text,
                html,
            })
        // ret = await sendEmailInternal({
        //     to: ['milton.segundo@aiautomationonline.de', 'kevin@aiautomationonline.de'],
        //     from: SMTP_USER,
        //     replyTo: [replyTo],
        //     subject,
        //     text,
        //     html,
        // })
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