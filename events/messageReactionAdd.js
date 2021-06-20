const ticketChannelData = require('../models/channel');
const createTicket = require('../exports/createTicket');
const guildModel = require('../models/guild');
const ticketModel = require('../models/ticket');
const fetchAll = require('discord-fetch-all');
const fs = require('fs');
const { MessageAttachment } = require('discord.js');

module.exports = async (client, reaction, user) => {
    const { message } = reaction;
    const IdData = await ticketChannelData.findOne({
        ticketGuildID: message.guild.id
    }).catch(err=>console.log(err))

    const ticketchannel = IdData.ticketChannelID

    var guildDoc = await guildModel.findOne({
        guildID: message.guild.id
    });

    if (!guildDoc) {
        guildDoc = new guildModel({
            guildID: message.guild.id,
            ticketCount: 0
        });

        await guildDoc.save();
    }

    const ticketDoc = await ticketModel.findOne({
        guildID: message.guild.id,
        userID: user.id
    });

    if (message.channel.id == ticketchannel && reaction.emoji.name == '🎫') {
        if (ticketDoc) {
            const channel = message.guild
                .channels.cache.get(ticketDoc.ticketID);

            if (!channel) {
                await ticketDoc.deleteOne();
                createTicket(message, user, guildDoc);
            }
        } else {
            createTicket(message, user, guildDoc);
        }
    } else if (message.id == (ticketDoc ? ticketDoc.msgID : null)) {
        if (reaction.emoji.name == '🔒') {
            if (!ticketDoc.ticketStatus) {
                message.channel.send({ embed: {
                        color: "YELLOW",
                        description: `Ticket closed by ${user}`
                    }
                });

                message.channel.updateOverwrite(
                    client.users.cache.get(ticketDoc.userID), {
                        SEND_MESSAGES: false,
                        VIEW_CHANNEL: false
                    }
                );

                const msg = await message.channel.send({ embed: {
                        color: "RED",
                        description: "📰 Ticket Transcript \n🔓 Reopen Ticket \n⛔ Close Ticket"
                    }}
                );

                await msg.react('📰');
                await msg.react('🔓');
                await msg.react('⛔');

                ticketDoc.msgPannelID = msg.id;
                ticketDoc.ticketStatus = true;

                await ticketDoc.save();
            }
        }
    } else if (message.id == (ticketDoc ? ticketDoc.msgPannelID : null)) {
        if (reaction.emoji.name == '📰') {
            const msgsArray = await fetchAll.messages(message.channel, {
                reverseArray: true
            });

            const content = msgsArray.map(m => `${m.author.tag} - ${m.embeds.length ? m.embeds[0].description : m.content}`);

            fs.writeFileSync('transcript.txt', content.join('\n'));

            message.channel.send(new MessageAttachment('transcript.txt', 'transcript.txt'));
        } else if (reaction.emoji.name == '🔓') {
            message.channel.updateOverwrite(
                client.users.cache.get(ticketDoc.userID), {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true
                }
            );

            const msg = await message.channel
                .messages.fetch(ticketDoc.msgPannelID);

            msg.delete();

            ticketDoc.msgPannelID = null;
            ticketDoc.ticketStatus = false;

            await ticketDoc.save();

            message.channel.send({ embed: {
                    color: "GREEN",
                    description: `Ticket opened by ${user}`
                }
            });
        } else if (reaction.emoji.name == '⛔') {
            message.channel.delete();
            await ticketDoc.deleteOne();
        }
    }
};