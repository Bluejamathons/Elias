const { character, character_ping_list, character_name_list } = require("../../../characterDefinition.json");
const { interaction_query, interaction_subquery, pronouns, negation } = require("../../../keywordDefinition.json");
const { maintenance, testServer, dev_username } = require("../../../config.json");
const { getError, getReply, checkCharacter, checkPronounQuery, checkParentChildQueries, checkCharacterPathValidity, setSentenceArray, setNegation, checkPreviousQuery } = require("../../func/chatInteractionFunctions");

module.exports = async (client, message) => {
    if (message.author.bot) {
        return;
    }
    /*
    CHECK FOR STICKERS
    if(message.stickers.first() !== undefined) {
        console.log("STICKER  DETECTED: " + message.stickers.first().name.toLowerCase());
    }

    CHECK FOR CUSTOM EMOJIS
    
    emojiContentCheck = message.content.replace(/1|2|3|4|5|6|7|8|9|0|<|>/g,"")
    
    if(emojiContentCheck.charAt(0) === "a") { emojiContentCheck = emojiContentCheck.slice(1, emojiContentCheck.length) }
    if(emojiContentCheck.charAt(0) === ":" && emojiContentCheck.charAt(emojiContentCheck.length - 1) === ":") {
        console.log("EMOJI DETECTED: " + emojiContentCheck.replace(/:/g, "").toLowerCase());
    }*/

    if (message.guildId === testServer) {
        console.log(message)
    }

    if (character_ping_list.some(word => message.content.toLowerCase().includes(word)) || (message.mentions.repliedUser !== null && character_name_list.some(word => message.mentions.repliedUser.username.includes(word)))) {
        if (maintenance && message.guildId !== testServer){
            message.reply({
                content: "Sorry, Elias is currently under maintenance. Please try again later. I apologize for any inconvenience. If you believe this to be a mistake, please contact " + dev_username,
            });
            return;
        }
        else {
            active_character = { name: "Elias", ping: "@", avatar: "https://i.imgur.com/YtchRmE.png", }
            // Checks content of the message for the ping call, to decide which character to use.
            checkCharacter(character.shiori, message)
            checkCharacter(character.kiyoshi, message)
            checkCharacter(character.min, message)
            checkCharacter(character.rica, message)
            
            setSentenceArray(message.content.toLowerCase())

            messageContent = ""
            queryPrevious = []

            for (let index = 0; index < readableSentenceArray.length; index++) {
                try {
                    queryPath = []
                    interactionContent = " " + readableSentenceArray[index] + " "
                    setNegation()
                    checkParentChildQueries(interaction_query)
                    checkParentChildQueries(interaction_subquery)
                    checkPronounQuery()
                    checkCharacterPathValidity()
                    if(checkPreviousQuery()) { messageContent = getReply(characterPathObject) }
                    if(messageContent === "" && active_character["invalid_query"] !== undefined) { messageContent = getReply(active_character["invalid_query"]) }
                } catch (error) { messageContent = getError(String(queryPrevious[queryPrevious.length - 1])) + ", Error Catch: " + error }
            }
            if(messageContent === "") { messageContent = getError(String(queryPrevious[queryPrevious.length - 1])) } // Error Catch : If the character does not have any replies or there was an issue in gathering overarching object array concatenation
            const channel = await client.channels.fetch(message.channelId);
            if(channel.type === 11 || channel.type === 12) {
                interactionWebhook = await (await client.channels.fetch(channel.parentId)).createWebhook({
                    name: active_character.name,
                    avatar: active_character.avatar,
                    reason: `Alias used by ${message.author.username} (ID: ${message.author.id})`,
                });
                await interactionWebhook.send({
                    content: messageContent,
                    threadId: await channel.id,
                });
            }
            else {
                interactionWebhook = await channel.createWebhook({
                    name: active_character.name,
                    avatar: active_character.avatar,
                    reason: `Alias used by ${message.author.username} (ID: ${message.author.id})`,
                });
                await interactionWebhook.send({
                    content: messageContent,
                });
            }
            await interactionWebhook.delete();
        }
    }
};