const { connect } = require('mongoose');
const { dburl } = require('../config.json');

module.exports = (client) => { // eslint-disable-line no-unused-vars
    console.log('Yo. This is ready!');

    connect(dburl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }).then(console.log('MongoDB Is Connected!'));
};