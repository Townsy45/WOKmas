const utils = require('../lib/utils');
const axios = require('axios');

module.exports = async (bot) => {
  
  let status;
  
  try {
    const req = await axios.get('https://christmas-days.anvil.app/_/api/get_days');
    status = (req.data) ? req.data['Days to Christmas'] + ` days till Christmas!` : 'Merry WOKmas!';
  } catch (err) { status = 'Merry WOKmas!' }

  await bot.user.setStatus(`dnd`);
  await bot.user.setActivity(status, { url: "https://www.twitch.tv/townsydaboss", type: "STREAMING" });

  await utils.log.info(`${bot.user.username} is ready and waiting!`);
};
