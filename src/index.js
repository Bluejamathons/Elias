require("dotenv").config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

eventHandler(client);

client.on("messageCreate", (message) => {
});

client.on("ready", () => {
    //debugLog();
});

//client.on("interactionCreate", (interaction) => {
//    if (!interaction.isChatInputCommand()) return;
//
//    if (interaction.commandName === "add") {
//        const num1 = interaction.options.get("first-number").value;
//        const num2 = interaction.options.get("second-number").value; //?.value for optional valuing
//        interaction.reply(num1 + " + " + num2 + " = " + (num1 + num2));
//    }
//});

client.login(process.env.TOKEN);