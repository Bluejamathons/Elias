const { devs, testServer, maintenance } = require("../../../config.json");
const getLocalCommands = require("../../util/getLocalCommands");


module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        )

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: "Only developers are allowed to run this command.",
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.testOnly) {
            if (!(interaction.guild.id === testServer)) {
                interaction.reply({
                    content: "This command cannot be ran here.",
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: "You do not have enough permissions to run this command.",
                        ephemeral: true,
                    });
                    break;
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;
                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't enough permissions to run this command.",
                        ephemeral: true,
                    });
                    break;
                }

            }
        }
        if (commandObject.allowedUsers?.length) {
            if(!commandObject.allowedUsers.includes(interaction.member.id)) {
                interaction.reply({
                    content: "You are not an allowed user for this command.",
                    ephemeral: true,
                });
                return;
            }
        }
        if (maintenance) {
            if(!(interaction.guild.id === testServer)) {
                interaction.reply({
                    content: "The bot is currently under maintenance, please wait. I apologize for any inconvenience.",
                    ephemeral: true,
                });
                return;
            }
        }

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(error);
    }
};