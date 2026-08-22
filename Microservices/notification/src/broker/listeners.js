const { sendEmail } = require('../email');
const { subscribeToQueue } = require('./broker');

module.exports = function () {

    subscribeToQueue('AUTH_NOTIFICATION.USER_CREATED', async (data) => {
    
        const emailHTMLTemplate = `
        <h1>Welcome to Our Service</h1>
        <p>Dear ${data.fullName.firstName + " " + (data.fullName.lastName || "")}</p>
        <p>Thank you for registering with us. We're excited to have on board!</p>
        <p>Best regards,<br/>The Team</p>
        ;`

        await sendEmail(data.email, "Welcome to Our Service", "Thank you for registering with us!", emailHTMLTemplate)
})

}