const ticketModel = require('../models/ticket');
const { MessageEmbed } = require("discord.js")

module.exports = async(message, user, guildDoc) => {
    const ticketData = require('../models/channel')
    const IdData = await ticketData.findOne({
        ticketGuildID: message.guild.id
    }).catch(err => console.log(err))

    guildDoc.ticketCount += 1;

    await guildDoc.save();

    const ticketChannel = await message.guild
        .channels.create(`ticket-${guildDoc.ticketCount}`, {
            permissionOverwrites: [{
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    id: user.id
                },
                {
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    id: message.guild.id
                }
            ]
        });
    const embed = new MessageEmbed()
        .setColor('BLUE')
        .setDescription('React with 🔒 to close this ticket.')

    const msg = await ticketChannel.send({ embeds: [embed] });

    msg.react('🔒');

    const ticketDoc = new ticketModel({
        guildID: message.guild.id,
        userID: user.id,
        ticketID: ticketChannel.id,
        ticketStatus: false,
        msgID: msg.id
    });

    await ticketDoc.save();
};