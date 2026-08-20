const amqplib = require('amqplib');

let channel, connection;


async function connect() {
    
    if (connection) return connection;

    try {
        connection = await amqplib.connect(process.env.RABBIT_URL);
        console.log('Connection to RabbitMQ');
        channel = await connection.createChannel();
    } catch (error) {
        console.error('Error conncetion to RabbitMQ', error)
    }
}