const { Client } = require("discord.js")
const clientEvent = (event) => require(`../events/${event}`)

/**
 * Loads the used by the client
 * @param {Client} client 
 */
function loadEvents(client) {
    client.on("ready", () => clientEvent("ready")(client));
    client.on("interactionCreate", (m) => clientEvent("interactionCreate")(m, client));
    client.on("messageReactionAdd", (m, n) => clientEvent("messageReactionAdd")(m, n, client));
}

module.exports = {
    loadEvents
};