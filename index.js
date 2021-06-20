const { token } = require('./config.json');
const { Client, DiscordAPIError, MessageEmbed } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION' ] });
const fs = require('fs');

const eventFiles = fs.readdirSync('./events');
for (const eventFile of eventFiles) {
    const event = require(`./events/${eventFile}`);
    const eventName = eventFile.split('.')[0];
    client.on(eventName, event.bind(null, client));
}

client.on('message', async(message)=>{
    var prefix = "!"
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/)

    const ticketBot = {
        "currentChannel": message.channel,
        "mentionedChannel": message.mentions.channels.first(),
        "argsAtZero": args[0],
        "argsAtOne": args[1]
    }

    if (message.content.startsWith(prefix+'setup')) {
        const filter = (m) => message.author.id === m.author.id;

        const channelData = require('./models/channel')

       ticketBot.currentChannel.send('Please send the channel ID where the panel will be created!')


       const ChannelID = await message.channel.awaitMessages(filter, {
        time: 30000,
        max: 1,
        errors: ["time"]
      });

      var channelID = ChannelID.first().content;

      
      let args1 = channelID

      const channel = message.guild.channels.cache.get(args1)

      if (!channel) {
          return message.channel.send('Please provide a valid channel ID!')
      }

      if (channel.type !== "text") {
          return message.channel.send('Provided channel is not a text channel!')
      }


      ticketBot.currentChannel.send('Please send the category ID where ticket Channel will be created!')

      const CategoryID = await message.channel.awaitMessages(filter, {
        time: 30000,
        max: 1,
        errors: ["time"]
      });
      var categoryID = CategoryID.first().content;
      
      let args2 = categoryID
      const category = message.guild.channels.cache.get(args2)

      if (!category) {
          return message.channel.send('Please provide a valid category ID!')
      }

      if (category.type !== "category") {
          return message.channel.send("The provided category doesn't belong to any channel category!")
      }


      let embed = new MessageEmbed()
      .setTitle('Support')
      .setDescription('React here to create a ticket!')
      .setColor('BLURPLE')

    var helpMessage = channel.send(embed).then(async(msg)=>{
         msg.react("🎫")
     })

      let newData = new channelData({
        ticketGuildID: message.guild.id,
        ticketChannelID: channelID,
        parentChannelID: categoryID,
    })

    newData.save();

      return ticketBot.currentChannel.send('Setup Completed')
        
    }
})
client.login(token);