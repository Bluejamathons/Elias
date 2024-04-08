const { ActivityType } = require("discord.js");
const { maintenance } = require("../../../config.json");

module.exports = async (client) => {
    if (maintenance === true) {
        client.user.setActivity({
            name: "🔧 Under Maintenance",
            type: ActivityType.Custom,
        });
    }
};