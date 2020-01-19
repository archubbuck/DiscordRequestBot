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

    const marketRequestsChannel = message.guild.channels.find(c => c.name.toLowerCase() === "requests".toLowerCase() &&
                c.parent && c.parent.name.toLowerCase() === "market".toLowerCase());

    const messageContent = args.join(" ");
    switch (command) {
        case "request":
            if (message.channel != marketRequestsChannel)
                return message.reply(`this command can only be used in the <#${marketRequestsChannel.id}> channel.`);

            if (!messageContent)
                return message.reply("please provide a brief description of your request.");

            let requestsCategory = message.guild.channels.find(c => c.name.toLowerCase() == "requests".toLowerCase() &&
                c.type.toLowerCase() == "category".toLowerCase());
            const channelOptions = {
                type: "text",
                parent: requestsCategory,
                topic: messageContent,
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
                    `Hello <@${message.author.id}>. Please wait patiently for an <@&${message.guild.roles.find('name', 'Admin').id}> to join the chat.`,
                    `**RID:** ${channel.name.split("-")[1]}`,
                    `**Request:** ${channel.topic}`
                ];
                channel.send(messages.join("\n"));
                // message.reply(`Your request has been submitted and a private channel has been created for you. Please join <#${channel.id}>.`);
            });
            break;
        case "close":
            if (!messageContent)
                return message.reply("Please provide a reason for closing this channel.");

            if (!message.channel.parent || message.channel.parent.name != "Requests")
                return message.reply("Sorry, you can't close this channel!");

            let marketArchiveChannel = message.guild.channels.find(c => c.name.toLowerCase() === "archive" &&
                c.parent && c.parent.name.toLowerCase() === "market");
            let messages = [
                `**RID:** ${message.channel.name.split("-")[1]}`,
                `**Request:** ${message.channel.topic}`,
                `**Closed By:** <@${message.author.id}>`,
                `**Notes:** ${messageContent}`
            ];
            marketArchiveChannel.send(messages.join("\n"));
            message.channel.delete();
            const user = message.channel.members.find(m => !m.roles.some(r => r.name.toLowerCase() === "admin"));
            let marketVouchesChannel = message.guild.channels.find(c => c.name.toLowerCase() === "vouches" &&
                c.parent && c.parent.name.toLowerCase() === "market");
            marketRequestsChannel.send(`Thank you for your request, <@${user.id}>. Please spend a few moments commenting on your experience in the <#${marketVouchesChannel.id}> channel. Customers who provide their feedback will be entered to win prizes!`);
            break;
        default:
            return message.reply("that command was not recognized.");
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