const Discord = require('discord.js')
const fs = require('fs')
const loadModules = require('./load-modules')
const loadCommands = require('./load-commands')
const utils = require('../lib/utils')

module.exports.run = async (client, message, args) => {
    const modules = loadModules()
    const commands = loadCommands()
    const prefix = await utils.x.getGuildPrefix(client, message.guild.id)
    let reply = ''
    const helpEmbed = new Discord.MessageEmbed()
    const colors = ["#146B3A", "#F8B229", "#BB2528"]
    const color = colors[Math.floor(Math.random() * colors.length)]

    if(!args[0] || args[0] === 'modules') {

        for (const module of modules)
            reply += `**${module}**\n`

            helpEmbed
            .setAuthor(`Help Menu`, client.user.displayAvatarURL())
            .setColor(color)
            .setDescription(`**My prefix is \`${prefix}\`**`)
            .addFields({
                name: 'Modules:', value: `${reply}`, inline: true
            })
            .setFooter(`Type ${prefix}help [module] to get help on a specific module`)

            return message.channel.send(helpEmbed)
    }
    else if(args[0] && !args[1]) {
        if(modules.findIndex(m => m.toLowerCase() === args[0].toLowerCase()) != -1) {
            for(const command of commands) {
                if(command.help.category.toLowerCase() === args[0].toLowerCase()) {
                    const commandName = command.help.name
                    var category = command.help.category
                    reply += `**${commandName}**\n`
                }
            }
            helpEmbed
            .setAuthor(`Module: ${category}`, client.user.displayAvatarURL())
            .setColor(color)
            .addFields({
                name: 'Commands:', value: `${reply}`, inline: true
            })
            .setFooter(`Type ${prefix}help [command] to get help on a specific command`)

            message.channel.send(helpEmbed)
        }
        else
        return message.channel.send(`No module found with the name '${args[0]}'`)
    }
    else if(args[1]) {
        if(modules.findIndex(m => m.toLowerCase() === args[0].toLowerCase()) != -1) {
            for(const command of commands) {
                if(command.help.name.toLowerCase() === args[1].toLowerCase() || command.help.aliases.findIndex(a => a.toLowerCase() === args[1].toLowerCase()) != -1) {
                    const aliases = command.help.aliases.join(', ') || 'none'
                    const description = command.help.descripiton || 'no description'
                    const commandName = command.help.name

                    helpEmbed
                    .setAuthor(commandName, client.user.displayAvatarURL())
                    .setColor(color)
                    .setDescription([
                        `**Description:** ${description}`,
                        // `**Usage:** \`${prefix}${cmd} ${command.usage}\``,
                        `**Aliases:** ${aliases}`
                    ])
                    .setFooter(`<> are mandatory, [] are optional`)

                    return message.channel.send(helpEmbed)
                }
            }
        }
    }
}

module.exports.help = {
    name: 'help',
    descripiton: 'shows list of commands',
    aliases: ['h'],
    category: 'none'
}