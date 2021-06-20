const ticketModel = require('../models/ticket');

module.exports = async (message, user, guildDoc) => {
    const ticketData = require('../models/channel')
    const IdData = await ticketData.findOne({
        ticketGuildID: message.guild.id
    }).catch(err=>console.log(err)) 

    const ticketcategory = IdData.parentChannelID
    guildDoc.ticketCount += 1;

    await guildDoc.save();

    const ticketChannel = await message.guild
        .channels.create(`ticket-${guildDoc.ticketCount}`, {
            parent: ticketcategory,
            permissionOverwrites: [
                {
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    id: user.id
                },
                {
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    id: message.guild.id
                }
            ]
        }
    );

    const msg = await ticketChannel.send({
        embed: {
            color: 'BLUE',
            description: 'React with 🔒 to close this ticket.',
        }
    });

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