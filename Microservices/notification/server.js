require('dotenv').config();
const app = require('./src/app');


app.listen(3006, () => {
    console.log("Notification service is running at port 3006")
})