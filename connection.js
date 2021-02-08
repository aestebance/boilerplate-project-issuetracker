require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(callback) {
    const URI = process.env.DB;
    const client = new MongoClient(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        await callback(client);

    } catch (err) {
        console.log(err);
        throw new Error('Unable to connect to Database');
    }
}

module.exports = main;
