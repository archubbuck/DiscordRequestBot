// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./auth.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "request") {
        const requestMessage = args.join(" ");

        const marketRequestsChannel = message.guild.channels.find(c => c.name.toLowerCase() === "requests".toLowerCase()
            && c.parent && c.parent.name.toLowerCase() === "market".toLowerCase());

        if (message.channel != marketRequestsChannel) {
            message.reply(`This command can only be used in the <#${marketRequestsChannel.id}> channel.`);
            return;
        }

        let requestsCategory = message.guild.channels.find(c => c.name.toLowerCase() == "requests".toLowerCase() 
            && c.type.toLowerCase() == "category".toLowerCase());
        const channelOptions = {
            type: "text",
            parent: requestsCategory,
            topic: requestMessage,
            permissionOverwrites: [{
                    id: message.author.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: message.guild.roles.find('name', '@everyone').id,
                    deny: ["VIEW_CHANNEL"]
                }
            ]
        };
        message.guild.createChannel(`${message.author.username}-${makeid(6)}`, channelOptions).then(channel => {
            let messages = [
                `**RID:** ${channel.name.split("-")[1]}`,
                `**Request:** ${channel.topic}`,
                `**Instructions:** Please wait patiently for an Admin to join the chat.`
            ];
            channel.send(messages.join("\n"));
            message.reply(`Your request has been submitted and a private channel has been created for you. Please join <#${channel.id}>.`);
        });
    }

    if (command === "close") {
        const closeMessage = args.join(" ");
        console.log(closeMessage);

        if (!closeMessage)
            return message.reply("Please provide a reason for closing this channel.");

        if (!message.channel.parent || message.channel.parent.name != "Requests")
            return message.reply("Sorry, you can't close this channel!");

        let archiveChannel = message.guild.channels.find(c => c.name.toLowerCase() === "requests".toLowerCase()
            && c.parent && c.parent.name.toLowerCase() === "archive".toLowerCase());
        let messages = [
            `**RID:** ${message.channel.name.split("-")[1]}`,
            `**Request:** ${message.channel.topic}`,
            `**Closed By:** ${message.author.username}`,
            `**Notes:** ${closeMessage}`
        ];
        archiveChannel.send(messages.join("\n"));
        message.channel.delete();
    }
});

client.login(config.token);

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}