const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema({
    ticketGuildID: String,
    ticketChannelID: String,
});

const channelModel = module.exports = new mongoose.model('channels', channelSchema)