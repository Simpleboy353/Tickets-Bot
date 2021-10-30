const { MessageEmbed } = require('discord.js');
const channelData = require("../../models/channel")

module.exports = {
    name: "ticket",
    description: "Setup or stop the tickets system in your server!",
    options: [{
            name: "setup",
            description: "Setp the tickets system for your server!",
            type: "SUB_COMMAND",
            options: [{
                name: "channel",
                description: "Set the channel for the tickets!",
                type: "CHANNEL",
                required: true,
            }, ],
        },
        {
            name: "stop",
            description: "Stop the tickets system for your server!",
            type: "SUB_COMMAND",
        },
    ],
    botPerms: ["EMBED_LINKS", "ADD_REACTIONS"],
    userPerms: ['ADMINISTRATOR'],
    run: async(client, interaction, args) => {
        if (interaction.options.getSubcommand() === "setup") {
            const channel = await interaction.options.getChannel("channel");
            const data = await channelData.findOne({
                ticketGuildID: interaction.guild.id,
            })

            if (data) {
                return interaction.reply({ content: "Ticket system is already enabled for your server!", ephemeral: true })
            } else if (!data) {
                let newData = new channelData({
                    ticketGuildID: interaction.guild.id,
                    ticketChannelID: channel.id,
                });
                await newData.save();

                let embed = new MessageEmbed()
                    .setTitle('Support')
                    .setDescription('React here to create a ticket!')
                    .setColor('BLURPLE')

                channel.send({ embeds: [embed] }).then(async(msg) => {
                    msg.react("🎫")
                })

                return interaction.reply({ content: "Ticket system has been enabled for your server!" })
            }
        } else if (interaction.options.getSubcommand() === "stop") {

            const data = await channelData.findOne({
                ticketGuildID: interaction.guild.id
            }).catch(console.error)

            if (data) {
                await channelData.findOneAndRemove({
                    ticketGuildID: interaction.guild.id
                });

                return interaction.reply({ content: "Ticket system has been disabled for your server!", ephemeral: true })
            } else if (!data) {
                return interaction.reply({ content: "Ticket system isn't enabled for your server!", ephemeral: true })
            }
        }
    }
}