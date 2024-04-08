const { character } = require("../../../characterDefinition.json");
const { misc_keywords } = require("../../../keywordDefinition.json");
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const { dev_username, devs } = require("../../../config.json");

module.exports = {
    name: "say",
    description: "Send a message under a given alias.",
    // devOnly: Boolean,
    // testOnly: Boolean,
    //allowedUsers: devs + [],
    options: [
        {
            name: "name",
            description: "The name of your alias.",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "avatar",
            description: "The avatar for your alias (URL).",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "message",
            description: "Message for your alias.",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "reply",
            description: "Enter a message ID to reply to. Reply pings are on by default.",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "reply-ping",
            description: "Set to false if you do not wish to ping with a reply.",
            type: ApplicationCommandOptionType.Number,
            choices: [
                {
                    name: "True",
                    value: 1,
                },
                {
                    name: "False",
                    value: 0,
                },
            ],
        },
        /*{
            name: "filepath",
            description: "Path to, including file name, of a file you wish to upload. Separate multiple with pipes |",
            type: ApplicationCommandOptionType.String,
        },
/*
        {
            name: "exact-name",
            description: "If true, will use the exact input of [name] instead of finding the nearest match",
            choices: [
                {
                    name: "True",
                    value: 1,
                },
                {
                    name: "False",
                    value: 0,
                },
            ],
            type: ApplicationCommandOptionType.Number,
        },
*/
    ],
    //deleted: true,
    permissionsRequired: [PermissionFlagsBits.ManageWebhooks],
    botPermissionsRequired: [PermissionFlagsBits.ManageWebhooks],

    callback: async (client, interaction) => {
        replyError = false;
        replySuccess = false;
        fileUploadError = false;
        messageSentError = false;
        avatarError = false;
        webhookEmbedArray = [];
        fileUploadArray = [];
        // Set options and etc to easy to access variables
        const channel = interaction.channel;
        nameInput = interaction.options.getString("name");
        msgInput = interaction.options.getString("message");
        replyInput = interaction.options.getString("reply");
        //exactInput = interaction.options.get("exact-name")?.value;
        active_character = { name: "~Custom Alias", embedColor: 0x0099FF, avatar: "https://i.imgur.com/YtchRmE.png", };
        if(interaction.options.getString("avatar").includes("https:/")) { active_character = { name: "~" + nameInput, embedColor: 0x0099FF, avatar: interaction.options.getString("avatar"), }; }
        else {
            interaction.reply({
                content: "The URL you entered is not a valid image link. Please try again with a valid URL. If you believe this to be a mistake, please contact " + dev_username,
                ephemeral: true,
            });
            avatarError = true;
        }
        // Look for keywords to define the character

        // Checks if the user requested to reply to a message
        if(replyInput === null) {}
        // Checks to make sure the user didn't enter anything other than a number
        else if(parseInt(replyInput)) {
            try {
                // Converts input number to a message object
                replyMessage = await channel.messages.fetch(replyInput)
                replySuccess = true;
            } catch (error) {
                // If input number could not be converted to message object
                interaction.reply({
                    content: "The value you entered for reply is not a valid ID for this channel. Please try again with a valid message ID. If you believe this to be a mistake, please contact " + dev_username + " with the following error code: (say.js.2) " + error,
                    ephemeral: true,
                });
                replyError = true;
            }
        }
        // If the user did not enter a number
        else {
            interaction.reply({
                content: "The value you entered for reply is not a valid number. Please try again with a valid message ID.",
                ephemeral: true,
            });
            replyError = true;
        }
        // Double checks that there is an active_character and there was no error in fetching the reply
        if (active_character.name !== "" && replyError === false && avatarError === false) {
            if(channel.type === 11 || channel.type === 12) {
                textChannel = await client.channels.fetch(channel.parentId);
            }
            else {
                textChannel = channel;
            }
            aliasWebhook = await textChannel.createWebhook({
                name: active_character.name,
                avatar: active_character.avatar,
                reason: `Alias used by ${interaction.user.username} (ID: ${interaction.user.id})`,
            });
            // If the reply was successfully converted into a message object
            if (replySuccess === true) {
                replyMessage = await channel.messages.fetch(replyInput)
                currentGuild = client.guilds.cache.get(replyMessage.guildId);
                repliedMessageURL = ("https://discord.com/channels/" + currentGuild.id + "/" + channel.id + "/" + replyMessage.id);
                // Bots, and more importantly webhooks, don't have the same properties as normal users. It is important to use separate methods to retrieve the desired data
                if (replyMessage.author.bot) {
                    repliedUserID = replyMessage.author.id
                    repliedUserName = replyMessage.author.username
                    repliedUserAvatarURL = ("https://cdn.discordapp.com/avatars/" + replyMessage.author.id + "/" + replyMessage.author.avatar + ".webp");
                }
                else {
                    repliedUserID = replyMessage.author.id;
                    repliedUser = await currentGuild.members.fetch(repliedUserID);
                    repliedUserName = repliedUser.nickname;
                    if (repliedUser.avatar !== repliedUser.user.avatar) {
                        repliedUserAvatarURL = ("https://cdn.discordapp.com/guilds/" + replyMessage.guildId + "/users/" + repliedUserID + "/avatars/" + repliedUser.avatar + ".webp");
                    } else {
                        repliedUserAvatarURL = ("https://cdn.discordapp.com/avatars/" + repliedUserID + "/" + repliedUser.user.avatar + ".webp");
                    }
                }

                // Check if the user requested to get rid of reply ping (will be false if no input)
                if(interaction.options.get("reply-ping")?.value !== 0) {
                    msgInput = "<@" + repliedUserID + "> " + msgInput
                }
                // Build the reply embed
                webhookEmbed = new EmbedBuilder()
                .setColor(active_character.embedColor)
                .setAuthor({ name: repliedUserName, iconURL: repliedUserAvatarURL, url: repliedMessageURL })
                .setDescription(replyMessage.content)
                webhookEmbedArray.push(webhookEmbed)
            }
            try {
                if(interaction.options.getString("filepath") !== null) {
                    filepathArray = interaction.options.getString("filepath").split("|");
                    if (filepathArray.length >= 10) {
                        interaction.reply({
                            content: "You have attempted to upload more files than the maximum (10). Please try again.",
                            ephemeral: true,
                        });
                        fileUploadError = true;
                    } else {
                        interaction.reply({
                            content: "Files are uploading. Please wait.",
                            ephemeral: true,
                        });
                        for (let index = 0; index < filepathArray.length; index++) {
                            fileUpload = new AttachmentBuilder()
                            .setFile(filepathArray[index]);
                            fileUploadArray.push(fileUpload);
                        }
                    }

                }
            } catch (error) {
                interaction.reply({
                    content: "The filepath you have attempted is invalid. Please try again with a valid filepath.",
                    ephemeral: true,
                });
                fileUploadError = true;
            }
            if(fileUploadError === false) {
                try {
                    if(channel.type === 11 || channel.type === 12) {
                        await aliasWebhook.send({
                            content: msgInput,
                            embeds: webhookEmbedArray,
                            files: fileUploadArray,
                            threadId: channel.id,
                        });
                    }
                    else {
                        await aliasWebhook.send({
                            content: msgInput,
                            embeds: webhookEmbedArray,
                            files: fileUploadArray,
                        });
                    }
                } catch (error) {
                    interaction.reply({
                        content: "An unexpected error occurred while constructing the message. This may be due to an incorrect filepath. If you believe this to be a mistake, contact " + dev_username + " Error Code say.js.3 " + error,
                        ephemeral: true,
                    });
                    messageSentError = true;
                }
            }
            if (replyError === false && fileUploadError === false && messageSentError === false) {
                try {
                    if(interaction.ephemeral === null) {
                        interaction.reply({
                            content: "Message sent without error.",
                            ephemeral: true,
                        });
                    } else {
                        interaction.editReply({
                            content: "Message sent without error.",
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    channel.send("Elias has timed out. Please wait before using more commands, interacting with characters, et cetera, so any pending processes can be completed. Thank you for your patience and agologies for any inconvenience.");
                }
            }
            await aliasWebhook.delete();
        }
    },
};