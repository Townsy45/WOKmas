const utils = require('../lib/utils'); // Custom utilities
const axios = require('axios'); // For requesting data
const cron = require('node-cron'); // For automatic requests

module.exports = async (client) => {
  // Update the status on a schedule
  cron.schedule('0 */6 * * *', async () => await _updateStatus(client), { scheduled: true });
  // Update it first here
  await _updateStatus(client);
  // Log the client is ready
  await utils.log.info(`${client.user.username} is ready and waiting!`);
};

async function _getDays() {
  try {
    // Fetch data
    const r = await axios.get('https://christmas-days.anvil.app/_/api/get_days');
    // Return data if exists
    if (r && r.data) return r.data['Days to Christmas'];
  } catch (err) {
    // Log any errors
    await utils.log.error('Failed getting days till christmas!', err.message || err);
  }
}

async function _updateStatus(client) {
  // Get the days until christmas
  const days = await _getDays();
  // Create the status
  const status = days ? `${days} day${days>1?'s':''} till Christmas!` : 'Merry WOKmas!';
  // Updated activity
  await client.user.setActivity(status, { url: "https://www.twitch.tv/townsydaboss", type: "STREAMING" });
  // Log status
  await utils.log.debug('Updating Bot Status ' + new Date().toISOString().replace(/[TZ]/g, ' ').split('.')[0].trim());
  await utils.log.debug(status);
}
