const shuffle = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

const Discord = require('discord.js')
const pg = require('../../lib/pg')

module.exports.run = async (client, message, args) => {
    const user = message.author
    const data = await pg.query('SELECT * FROM wokmas.trivia')
    let userData = await pg.query(`SELECT * FROM wokmas.stats WHERE userid = '${user.id}'`)

    if (!userData) {
        await pg.query(`INSERT INTO wokmas.stats (userid) VALUES ('${user.id}')`)
        userData = await pg.query(`SELECT * FROM wokmas.stats WHERE userid = '${user.id}'`)
    }

    const random = Math.floor(Math.random() * data.length)

    const result = data[random]

    const { id } = result
    const { question } = result
    const correctAnswer = result.correct
    const incorrectAnswers = result.incorrect
    const { points } = result
    const timesAsked = result.times_asked
    const quizCategory = result.quiz_category

    let options = ''

    const answers = incorrectAnswers
    answers.push(correctAnswer)
    let ascii = 65

    const randomArray = shuffle(answers)
    let correctOption

    for (const ans of randomArray) {
        if (ans === correctAnswer)
            correctOption = String.fromCharCode(ascii)
        options += `${String.fromCharCode(ascii)}) ${ans}\n`
        ascii++
    }

    const colors = ["#146B3A", "#BB2528"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    let questionEmbed = new Discord.MessageEmbed()
        .setAuthor(`${user.username}'s Trivia Question`, user.displayAvatarURL())
        .setColor('YELLOW')
        .setDescription(`**Please wait for the reactions to load**`)

    const msg = await message.channel.send(questionEmbed)

    await msg.react('785352097498923008')
    await msg.react('785352319927582740')
    await msg.react('785352350893473822')
    await msg.react('785352486626000896')

    questionEmbed = new Discord.MessageEmbed()
        .setAuthor(`${user.username}'s Trivia Question`, user.displayAvatarURL())
        .setColor(randomColor)
        .setDescription(`**${question}**
    You have 10 seconds to respond with the correct answer.
    
    ${options}`)
        .addField(`Points`, `\`${points}\``, true)
        .addField(`Time Asked`, `\`${timesAsked}\``, true)
        .addField(`Cateogry`, `\`${quizCategory}\``, true)

    msg.edit(questionEmbed)

    let replyEmbed = new Discord.MessageEmbed()

    let correctReaction
    // console.log(correctAnswer, correctOption)
    if (correctOption === 'A')
        correctReaction = '785352097498923008'
    else if (correctOption === 'B')
        correctReaction = '785352319927582740'
    else if (correctOption === 'C')
        correctReaction = '785352350893473822'
    else if (correctOption === 'D')
        correctReaction = '785352486626000896'

    const filter = (reaction, user) => {
        return ['785352097498923008', '785352319927582740', '785352350893473822', '785352486626000896'].includes(reaction.emoji.id) && user.id === message.author.id
    }

    msg.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
        .then(async collected => {
            const reply = collected.first()
            const reaction = reply.emoji.id
            msg.reactions.removeAll()
            if (reaction !== correctReaction) {
                msg.edit(replyEmbed.setTitle('<:WOK_WRONG:785454606197063700> **Nope, you got that wrong.**').setColor('RED'))
                await pg.query(`UPDATE wokmas.stats SET incorrect = ${userData.incorrect + 1} WHERE userid = '${user.id}'`)
            }
            else {
                msg.edit(replyEmbed.setTitle('<:WOK_RIGHT:785111937612644383> **Great, you got it correct.**').setColor('GREEN'))
            await pg.query(`UPDATE wokmas.stats SET (points, correct) = (${userData.points + points}, ${userData.correct + 1}) WHERE userid = '${user.id}'`)
        }
    })
        .catch(async () => {
            msg.reactions.removeAll()
            msg.edit(replyEmbed.setTitle('<:WOK_WRONG:785454606197063700> **You did not respond in time.**').setColor('RED'))
            await pg.query(`UPDATE wokmas.stats SET incorrect = ${userData.incorrect + 1} WHERE userid = '${user.id}'`)
        })
    await pg.query(`UPDATE wokmas.trivia SET times_asked = ${timesAsked + 1} WHERE id = '${id}'`)
}

module.exports.help = {
    name: 'trivia',
    description: "",
    aliases: [],
    category: 'Fun'
}