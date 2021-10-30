const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "eval",
    description: "Run a whole fuckin' code with this!",
    options: [
        {
            name: "code",
            description: "The code to evaluate",
            type: "STRING",
            required: true
        }
    ],
    ownerOnly: true,
    run: async(client, interaction, args) => {
        try {
            const code = await interaction.options.getString("code")
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            let embed = new MessageEmbed()
                .setAuthor("Eval")
                .setColor("GREEN")
                .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                .addField("Output", `\`\`\`js\n${evaled}\n\`\`\``)

            interaction.reply({ embeds: [embed] }).catch(console.error);
        } catch (err) {
            interaction.followUp(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
        }
    }
}