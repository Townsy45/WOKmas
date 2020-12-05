const Discord = require('discord.js');
const utils = require('../../lib/utils');
const table = require('string-table');

module.exports.run = async (client, message, args) => {
  /*
    Leaderboard command
      - Usage: !leaderboard [mobile]
    Sends the top 10 users with the most points
  */
  // Define user device status (mobile, desktop, web)
  let cStatus = Object.keys(message.author.presence.clientStatus)[0];
  // Check if mobile is sent as a argument
  if (args[0] && ['mobile', 'web', 'desktop'].includes(args[0].toLowerCase())) cStatus = args[0].toLowerCase();
  // Check user is in DB and get their stats
  let leaders = await utils.x.getPointsLeaderboard();
  // If no data is returned send an error
  if (!leaders) return await utils.x.sendError(message, `**Failed to fetch the leaderboard, please try again!**`);
  // Send loading message
  let msg = await message.channel.send(`<a:loading3:784896699000815666> Loading leaderboard...`);
  // Create the leaderboard embed
  const board = new Discord.MessageEmbed()
    .setTitle(`🎄 Top 10 Users (Points)`)
    .setDescription(await _getTop10(client, leaders, cStatus))
    .setColor(utils.colour.hidden);
  // Set footer if on mobile
  if (cStatus === 'mobile') board.setFooter('This is the mobile version of this leaderboard.')
  // Edit the message to send the embed
  await msg.edit('', { embed: board });
}

module.exports.help = {
  name: "leaderboard",
  description: "Show the top 10 players in a leaderboard and the position of the user requesting.",
  aliases: ['leaderboards', 'l', 'top10'],
  category: "Fun",
}

async function _getTop10(client, data, cStatus) {
  // Check data is sent
  if (!data && typeof data === 'object') return;
  // Build String
  let users = [];
  for (const user of data) {
    // Define a member variable so we can access the fetch data outside the try catch
    let member;
    // Fetch the users or default to [Unknown User]
    try {
      let fetch = await client.users.fetch(user.id);
      if (fetch) member = fetch;
    } catch (err) { member = '[Unknown User]' }
    // Mobile Mode - Push the string to the array for the embed
    if (cStatus === 'mobile') users.push(`**#${user.position}** ${member} - ${user.points} points`);
    // Desktop Mode - Push the users to an array for the table
    else users.push({ position: '#' + user.position, user: member.username || member, points: user.points });
  }
  // Define here as it is used in many places below.
  let board = 'No Board Found!';
  // If they use mobile then send the string version
  if (cStatus === 'mobile') board = users.join('\n');
  // Create a table for desktop users
  else board = `\`\`\`asciidoc\n${table.create(users, {
    capitalizeHeaders: true,
    formatters: {
      user: (value) => { return { value: value.split('', 16).reduce((o, c) => o.length === 15 ? `${o}${c}...` : `${o}${c}` , '') }},
      points: (value) => { return { value: value.toLocaleString(), format: { alignment: 'left' } } }
    }
  })}\n\`\`\``;
  // Return the leaderboard
  return board;
}
