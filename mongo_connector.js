const mongoose = require('mongoose');

async function getDatabase() {
    return await mongoose.connect('mongodb://' + defaultConfig.mongo.host + ':' + defaultConfig.mongo.port + '/' + defaultConfig.mongo.db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}

module.exports = async () => {
    global.db = await getDatabase();
};