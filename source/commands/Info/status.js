const Discord = require('discord.js');
const fs = require("fs")
const { join } = require('path');
const load = "<a:loading3:784896699000815666>"
// const eventDir = join(__dirname, '..', 'events');
const eventDir = "bruh"
// const events = fs.readdirSync("eventDir");
const events = "bruh"

const moment = require("moment")
require('moment-duration-format')

module.exports.run = async (client, message, args) => {
  
const uptime = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]')
const apiL = Math.round(client.ws.ping)
const msg = await message.channel.send(load + " | Loading Status")
const ping = new Date().getTime() - message.createdTimestamp
const users = "Users      :: " + client.users.cache.size
const guilds = "Servers    :: " + client.guilds.cache.size
const channels = "Channels   :: " + client.channels.cache.size
const nodeV = "Node       :: " + process.version
const djsV = "Discord.js :: " + Discord.version
const Colors = ["#165B33", "#146B3A", "#F8B229", "#BB2528"]
const up = "Uptime      :: " + uptime
const p = "Bot Latency :: " + ping + "ms"
const l = "Api Latency :: " + apiL + "ms"
const cmds = "Commands    :: " + client.commands.size
const event = "Events      :: " + client.events
const embed = new Discord.MessageEmbed()
.setAuthor("WOKmas Staticstics", client.user.displayAvatarURL())
.addField("<:yes:785565989944819712> Modules", `\`\`\`asciidoc\n${users}\n${guilds}\n${channels}\n${nodeV}\n${djsV}\`\`\``)
.addField("<:yes:785565989944819712> Engines", `\`\`\`asciidoc\n${up}\n${p}\n${l}\n${cmds}\n${event}\`\`\``)
.setColor(Colors[Math.floor(Math.random() * Colors.length)])
msg.edit("", embed)
}

module.exports.help = {
    name: "status",
    description: "Shows Status of the Bot",
    aliases: ['uptime'],
    category: "Info",
  }
