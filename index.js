const { Client, MessageEmbed, Intents, Collection } = require('discord.js');
const { token } = require('./config.json')
const { loadEvents } = require("./handler/loadEvents")
const { loadSlashCommands } = require("./handler/loadSlashCommands")
const { checkValid } = require("./exports/checkValid")
const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION' ],
    allowedMentions: { parse: ["users", "roles"] },
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_PRESENCES,
    ],
});
client.slash = new Collection()
loadEvents(client);
loadSlashCommands(client);
checkValid();

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: " + err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.log(
        "[FATAL] Possibly Unhandled Rejection at: Promise ",
        promise,
        " reason: ",
        reason.message
    );
});

client.login(token);