const ticketChannelData = require('../models/channel');
const createTicket = require('../exports/createTicket');
const guildModel = require('../models/guild');
const ticketModel = require('../models/ticket');
const fetchAll = require('discord-fetch-all');
const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = async(reaction, user, client) => {
    const { message } = reaction;
    const IdData = await ticketChannelData.findOne({
        ticketGuildID: message.guild.id
    }).catch(err => console.log(err))

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
        reaction.users.remove(user).catch(console.error);
        if (ticketDoc) {
            const channel = message.guild
                .channels.cache.get(ticketDoc.ticketID);

            if (!channel) {
                await ticketDoc.deleteOne();
                createTicket(message, user, guildDoc);
                console.log("New Ticket Created!")
            }
        } else {
            createTicket(message, user, guildDoc);
            console.log("New Ticket Created!")
        }
    } else if (message.id == (ticketDoc ? ticketDoc.msgID : null)) {
        if (reaction.emoji.name == '🔒') {
            reaction.users.remove(user).catch(console.error);

            const closeEmbed = new MessageEmbed()
                .setColor("YELLOW")
                .setDescription(`Ticket closed by ${user}`)

            if (!ticketDoc.ticketStatus) {
                message.channel.send({
                    embeds: [closeEmbed]
                });

                message.channel.permissionOverwrites.edit(
                    client.users.cache.get(ticketDoc.userID), {
                        SEND_MESSAGES: false,
                        VIEW_CHANNEL: false
                    }
                );

                const closingEmbed = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`📰 Ticket Transcript \n🔓 Reopen Ticket \n⛔ Close Ticket`)
                const msg = await message.channel.send({
                    embeds: [closingEmbed]
                });

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

            message.channel.send({ files: [{ attachment: "transcript.txt", name: "transcript.txt" }] });
        } else if (reaction.emoji.name == '🔓') {
            message.channel.permissionOverwrites.edit(
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

            const openEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`Ticket opened by ${user}`)
            message.channel.send({
                embeds: [openEmbed]
            });
        } else if (reaction.emoji.name == '⛔') {
            message.channel.delete();
            await ticketDoc.deleteOne();
        }
    }
};