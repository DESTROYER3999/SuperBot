require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

let prefix = "["
let on = false;
let blacklist = [];
let roles = ["@everyone"];
let action = "kick";

client.on("ready", discordReady);
client.on("guildMemberAdd", onJoin);
client.on("message", onMessage)

function discordReady(e) {
    console.log("Bot ready with Discord!");
}

function onJoin(member) {
    if (on) {
        if (!validateMember(member)) {
            if (action == "kick") {
                member.kick();
            } else if (action == "ban") {
                member.ban();
            }
        }
    }
}

function validateMember(member) {
    let valid = true;
    for (let blacklistItem of blacklist) {
        if (member.user.username.includes(blacklistItem)) {
            valid = false;
            break;
        }
    }
    return valid;
}

function onMessage(msg) {
    if (msg.content.charAt(0) != prefix) {
        return;
    }
    let hasRole = false;
    msg.member.roles.cache.some((role) => {
        if (roles.includes(role.name)) {
            hasRole = true;
        }
    });


    let splitMsg = msg.content.slice(1).split(" ");
    let newItem;
    switch (splitMsg[0]) {
        case "action":
            if (!hasRole) {
                msg.react("🚫");
                break;
            }
            switch (splitMsg[1]) {
                case "kick":
                case "k":
                case "1":
                    action = "kick";
                    msg.reply("Set action to `kick`");
                    break;
                case "ban":
                case "b":
                case "2":
                    action = "ban";
                    msg.reply("Set action to `ban`");
                    break;
                case "help":
                case "h":
                case "?":
                    msg.reply(`The action (currently set to \`${action}\`) is what the bot will do to members that join and are blacklisted.\nUse \`action kick\` to set the action to kick\nUse \`action ban\` to set the action to ban`);
                    break;
                default:
                    msg.reply("Unrecognized command!");
                    break;
            }
            break;
        case "count":
            msg.guild.members.fetch().then((members) => {
                let personCount = 0;
                for (let member of members) {
                    if (validateMember(member[1]) && !member[1].user.bot) {
                        personCount += 1;
                    }
                }
                msg.reply(`Counted \`${personCount}\` un-blacklisted members!`);
            }).catch(console.error);
            break;
        case "role":
        case "roles":
        case "r":
            if (!hasRole) {
                msg.react("🚫");
                break;
            }
            switch (splitMsg[1]) {
                case "add":
                    newItem = splitMsg.slice(2).join(" ").replace(/`/g, "");
                    if (!newItem) {
                        msg.reply("You can't add an empty string to the roles list!")
                        break;
                    }
                    if (roles.includes(newItem)) {
                        msg.reply("That is already in roles!");
                        break;
                    }
                    roles.push(newItem);
                    msg.reply("Added to roles!");
                    break;

                case "remove":
                case "rm":
                    newItem = splitMsg.slice(2).join(" ").replace(/`/g, "");
                    if (!roles.includes(newItem)) {
                        msg.reply("That is not in roles!");
                        break;
                    }
                    if (roles.length == 1) {
                        msg.reply("There must be at least one role!");
                        break;
                    }
                    roles.splice(roles.indexOf(newItem), 1);
                    msg.reply("Removed from roles!");
                    break;

                case "list":
                case "l":
                    msg.reply(`Here are the roles:`);
                    let roleString = "";
                    for (let role of roles) {
                        roleString += `\`${role}\`,`;
                    }
                    if (roleString) {
                        msg.channel.send(roleString);
                    } else {
                        msg.channel.send("Roles list is empty, Use `role add [string]` to add to roles");
                    }
                    break;
                case "help":
                case "h":
                case "?":
                    msg.reply("People with roles on this list will be able to use this bot's commands.\nUse `role add [string]` to add to roles\nUse `role remove [string]` to remove from roles\nUse `role list` to see the roles");
                    break;
                default:
                    msg.reply("Unrecognized command!");
                    break;
            }
            break

        case "on":
            if (!hasRole) {
                msg.react("🚫");
                break;
            }
            if (on) {
                msg.reply("Already `on`!");
                break;
            }
            on = true;
            msg.reply("Turned `on`!");
            break;
        case "off":
            if (!hasRole) {
                msg.react("🚫");
                break;
            }
            if (!on) {
                msg.reply("Already `off`!");
                break;
            }
            on = false;
            msg.reply("Turned `off`!");
            break;

        case "blacklist":
        case "blacklists":
        case "bl":
            if (!hasRole) {
                msg.react("🚫");
                break;
            }
            switch (splitMsg[1]) {
                case "add":
                    newItem = splitMsg.slice(2).join(" ");
                    if (!newItem) {
                        msg.reply("You can't add an empty string to the blacklist!")
                        break;
                    }
                    if (blacklist.includes(newItem)) {
                        msg.reply("That is already in the blacklist!");
                        break;
                    }
                    blacklist.push(newItem);
                    msg.reply("Added to blacklist!");
                    break;

                case "remove":
                case "rm":
                    if (!blacklist.includes(splitMsg.slice(2).join(" "))) {
                        msg.reply("That is not in the blacklist!");
                        break;
                    }
                    blacklist.splice(blacklist.indexOf(splitMsg.slice(2).join(" ")), 1);
                    msg.reply("Removed from blacklist!");
                    break;

                case "list":
                case "l":
                    msg.reply("Here is the blacklist:");
                    let blacklistString = "";
                    for (let blacklistItem of blacklist) {
                        blacklistString += `\`${blacklistItem}\`,`;
                    }
                    if (blacklistString) {
                        msg.channel.send(blacklistString);
                    } else {
                        msg.channel.send("Blacklist is empty, Use `blacklist add [string]` to add to blacklist");
                    }
                    break;
                case "clear":
                    blacklist = [];
                    msg.reply("Blacklist was cleared!");
                    break;
                case "help":
                case "h":
                case "?":
                    msg.reply("When someone joins the server, if their username contains any of the items on the blacklist, they will be either kicked or banned.\nUse `blacklist add [string]` to add to blacklist\nUse `blacklist remove [string]` to remove from blacklist\nUse `blacklist clear` to clear the blacklist\nUse `blacklist list` to see the blacklist");
                    break;
                default:
                    msg.reply("Unrecognized command!");
                    break;
            }
            break
        case "help":
        case "h":
        case "?":
            msg.reply("\nUse `count` to count the non-blacklisted members\nUse `role help` to get help with roles\nUse `blacklist help` to get help with the blacklist\nUse `action help` to get help with the action\nUse `on` to turn the bot detector on\nUse `off` to turn the bot detector off");
            break;
        default:
            msg.reply("Unrecognized command!");
            break;
    }

}
