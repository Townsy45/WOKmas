require("dotenv").config(); // For the environment variables
const Discord = require("discord.js"); // Discord.js for the bot
const fs = require('fs');
const { join } = require('path');
const pg = require('./pg');
const log = require('./utils/log');

/* Normal Util functions */
const x = {
  async getGuildPrefix(client, guild) {
    // Check params
    if (!client || !guild) return;
    // Check if cache exists
    if (!client.prefixes) client.prefixes = new Discord.Collection();
    // Get prefix from cache
    let prefix = client.prefixes.get(guild);
    // Check cache if there is a prefix already saved
    if (prefix) return prefix;
    // Check if guild is in database
    await this.checkGuildConfig(client, guild);
    // Prefix not found in cache so update the cache with the database
    const db = await pg.query(`SELECT prefix FROM wokmas.config WHERE guild = '${guild}'`);
    // Check if database returned a prefix or not
    if (db.prefix) prefix = db.prefix;
    // Check if the database returned nothing, return default prefix
    if (!prefix) prefix = process.env.DEFAULT_PREFIX;
    // Update the cache
    client.prefixes.set(guild, prefix);
    // Return the prefix
    return prefix;
  },

  async setGuildPrefix(client, guild, prefix) {
    // Check params
    if (!client || !guild || !prefix) throw 'Invalid params sent!';
    // Cache check exists
    if (!client.prefixes) client.prefixes = new Discord.Collection();
    // Define prefix from cache or default
    const cache = client.prefixes.get(guild);
    let sysPrefix = cache || process.env.DEFAULT_PREFIX;
    // If cache doesnt exist fetch from the database
    if (!cache) {
      await this.checkGuildConfig(client, guild);
      let DB = await pg.query(`SELECT prefix FROM wokmas.config WHERE guild = '${guild}'`); // Fetches the prefix from database
      if (DB) sysPrefix = DB.prefix; // Set the db prefix if it exists
    }
    // Check if the prefix is the same
    if (sysPrefix === prefix) throw 'Prefix is the same as the current!';
    // Update cache and database
    client.prefixes.set(guild, prefix);
    await pg.query(`UPDATE wokmas.config SET prefix = '${prefix}' WHERE guild = '${guild}'`);
  },

  async checkGuildConfig(client, guild) {
    // Check params
    if (!client || !guild) throw 'Invalid argument sent!';
    // Check config cache exists
    if (!client.config) client.config = new Discord.Collection();
    // Check if guild is in the config cache
    if (!client.config.get(guild)) {
      let DB = await pg.query(`SELECT guild FROM wokmas.config WHERE guild = '${guild}'`);
      if (DB) client.config.set(guild, true); // Add the guild to the cache
    }
    // Return if the guild is in the cache
    if (client.config.get(guild)) return;
    // Insert the guild into the config database
    await pg.query(`INSERT INTO wokmas.config (guild) VALUES ('${guild}')`);
    client.config.set(guild, true); // Add it to the cache
  },

  async getUserStats(user) {
    // Check user is sent
    if (!user) return;
    // Check if user is in the database
    let stats = await _getStats(user);
    // User is not in database, create them
    if (!stats) {
      await pg.query(`INSERT INTO wokmas.stats (userid) VALUES ('${user}')`);
      stats = await _getStats(user);
    }
    // Return the user stats
    return stats;
  },

  async getPointsPosition(user) {
    // Check user is sent
    if (!user) return;
    // Get the users position in the leaderboard
    let data = await pg.query(`SELECT * FROM (SELECT userid, ROW_NUMBER () OVER (ORDER BY points DESC) as position FROM wokmas.stats) x WHERE userid = '${user}';`);
    if (data && data.position) return data.position;
  },

  async sendError(message, error, embed = true) {
    // Check message object is sent
    if (!message) return;
    // Default error message
    if (!error) error = 'An unknown error occurred, please try again!';
    // Send the message
    if (embed) error = new Discord.MessageEmbed()
      .setDescription(error)
      .setColor(colour.error)
      .setFooter(`If this re-occurs please report it to our discord: ${await this.getGuildPrefix(message.client, message.guild.id)}support`);
    message.channel.send(error)
  }
};

/* Core system functions
    - Created by Townsy#0001 https://github.com/Townsy45
*/
const core = {

  // Create the bot and collections
  async createBot() {
    const bot = new Discord.Client(); // Create the bot instance
    bot.commands = new Discord.Collection(); // Create a commands collection
    bot.aliases = new Discord.Collection(); // Create an events collection
    await bot.login(process.env.TOKEN); // Login the bot
    return bot;
  },

  // Event Handler
  async loadEvents(bot) {
    const eventDir = join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventDir);

    eventFiles.forEach(file => {
      const event = require(`${eventDir}/${file}`);
      const eventName = file.split('.').shift();
      bot.on(eventName, event.bind(null, bot));
      delete require.cache[require.resolve(`${eventDir}/${file}`)];
    });

    bot.events = eventFiles.length;
    await log.info(`Loaded ${bot.events} events!`)

    return eventDir;
    // return glob(__dirname + '/')
  },

  // Command Handler
  async loadCommands(bot) {
    const commandDir = join(__dirname, '..', 'commands');

    let files = await this.getAllFiles(commandDir);

    if (files) {
      for (const f of files) {
        let props = require(f);
        if (props.help) {
          bot.commands.set(props.help.name, props);
          if (props.help.aliases && Array.isArray(props.help.aliases))
            for (const alias of props.help.aliases)
              bot.aliases.set(alias, props.help.name);
        }
      }
      await log.info(`Loaded ${files.length} commands!`)
    } else {
      await log.warn('No Commands Found!');
    }
  },

  // Get all files recursively
  async getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (fs.statSync(dirPath + "/" + file).isDirectory())
        arrayOfFiles = await this.getAllFiles(dirPath + "/" + file, arrayOfFiles);
      else arrayOfFiles.push(join(dirPath, "/", file));
    }

    return arrayOfFiles;
  },


};

/* Common colours used for embeds */
const colour = {
  red: '#ff5858',
  error: '#b50d0d',
  green: '#2cf32c',
  success: '#00fc65',
  yellow: '#ffd500',
  hidden: '#36393F'
}

module.exports = { x, core, log, colour };


async function _getStats(u) {
  return await pg.query(`SELECT points, correct, incorrect FROM wokmas.stats WHERE userid = '${u}'`);
}
