const Discord = require('discord.js');
const utils = require('../../lib/utils');

module.exports.run = async (client, message, args) => {

  // !stats @user
  // !stats 117777289382382
  // !stats

  const user = (args[0]) ? message.mentions.users.first() || await client.users.fetch(args[0], true) : message.author;
  // Check user is in DB and get their stats
  let stats = await utils.x.getUserStats(user.id);
  if (!stats) return await utils.x.sendError(message, `**Failed to fetch your stats!**`);

  const results = new Discord.MessageEmbed()
    .setTitle(`Stats for ${user.tag}`)
    .setDescription(`**Points Leaderboard Position:** \`#${await utils.x.getPointsPosition(user.id)}\``)
    .addField('Points', stats.points, true)
    .addField('Correct Answers', stats.correct, true)
    .addField('Incorrect Answers', stats.incorrect, true)
    .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
    .setColor(utils.colour.red);

  await message.channel.send({ embed: results });
}

module.exports.help = {
  name: "stats",
  description: "Show the stats of a player, how many points they have and their answers count.",
  aliases: ['s'],
  category: "Fun",
}
