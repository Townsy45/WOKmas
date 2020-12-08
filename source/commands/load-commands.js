const path = require('path')

const fs = require('fs')

module.exports = (client) => {

    const commands = []

    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                    readCommands(path.join(dir, file))
            } else if (file !== 'load-commands.js' && file !== 'load-modules.js') {
                const option = require(path.join(__dirname, dir, file))
                commands.push(option)
            }
        }
    }

    readCommands('.')

    return commands
}