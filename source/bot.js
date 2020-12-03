/*
    CREATED BY Townsy#0001 - Wed 2nd December 2020
    https://github.townsy.dev/
    https://townsy.dev/
*/

require('dotenv').config(); // Setup environment variables
const PG = require('./lib/pg'); // Custom postgres module
const Utility = require('./lib/utils'); // Custom utility module for useful commands.

(async () => {
  // Create the bot
  const Bot = await Utility.core.createBot();
  // Load the commands in the command folder
  await Utility.core.loadCommands(Bot);
  // Same with events in the events folder
  await Utility.core.loadEvents(Bot);
  // Connect to the postgres database
  await PG.connect();
})()
