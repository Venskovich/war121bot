// Setting up bot
const TelegramApi = require("node-telegram-bot-api")
const token = require("./token");
const bot = new TelegramApi(token, { polling: true })

// Getting data from data bases and declaring variables to operate with them
const dev = require("./dev.json")
const specialChatId = require("./specialChatId.json")
const econ = require("./econ.json")
var players = require("./players.json")
// var unions = require("./unions.json")
var banlist = require("./banlist")
var stats = require("./stats")

// Import
const { sendMessage, deleteMessage, saveBanlist, savePlayers, saveStats, isRequest, delayToNextHour } = require("./otherFunctions")
const { getStats, ban } = require("./devFunctions")
const { getPlayer, updateCaptured } = require("./playerFunctions")
const { about, buy, sell, attack, give, readme, start, rename, union, best } = require("./mainFunctions")



// Setting up commands (visible in telegram)
bot.setMyCommands([
    { command: "/attack", description: "Attack a state" },
    { command: "/buy", description: "Buy sol || fac" },
    { command: "/sell", description: "Sell sol || fac" },
    { command: "/about", description: "State info" },
    // { command: "/union", description: "Create or join a union" },
    { command: "/best", description: "Greatest states" },
    { command: "/give", description: "Support a state" },
    { command: "/readme", description: "Gameplay & Updates news" }
])

// Creating these variables to operate easier
const commands = {
    attack: "/attack",
    buy: "/buy",
    sell: "/sell",
    about: "/about",
    union: "/union",
    best: "/best",
    give: "/give",
    readme: "/readme",

    stats: "/stats@war121bot",
    ban: "/ban@war121bot",

    rename: "/rename",
    start: "/start"
}
const allCommands = ["/attack", "/attack@war121bot", "/buy", "/buy@war121bot", "/sell", "/sell@war121bot", "/about", "/about@war121bot", "/union", "/union@war121bot", "/best", "/best@war121bot","/give", "/give@war121bot", "/readme", "/readme@war121bot", "/rename", "/rename@war121bot", "/start", "/start@war121bot"]
const devCommands = ["/stats@war121bot", "/ban@war121bot"]



// Main 
bot.on("message", msg => {

    // Creating these variables to make it easier to operate with message
    let text = msg.text.toLowerCase()
    let chatId = msg.chat.id
    let msgId = msg.message_id
    let user = msg.from

    // Declaring player variable. It is initialized if the user calls any bot command
    // Declared to make it easier to operate with player data
    let player = null

    // Variable which contains message reply text
    let reply = ""


    // If a message is not a command request, then ignore it and do not execute the following code
    // The same is if message was sent by bot
    // Otherwise create the new player or initialize it
    if ((!isRequest(allCommands, text) && !(devCommands.includes(text) && user.id === dev.id))) {

        return

    } else {

        if (user.is_bot || (msg.reply_to_message && msg.reply_to_message.from.is_bot)) {
            deleteMessage(bot, chatId, msgId)
            return
        }

        player = getPlayer(user, players)
        savePlayers(players)

    }


    // Bot commands
    if (text.includes(commands.attack)) {

        if (!msg.reply_to_message) {
            reply = `<a href="tg://user?id=${player.id}">${player.name}</a>, please reply message of that player, who you wish to attack`
        } else {
            reply = attack(player, getPlayer(msg.reply_to_message.from, players))
            savePlayers(players)
        }


    } else if (text.includes(commands.buy)) {

        reply = buy(player, text)
        savePlayers(players)

    } else if (text.includes(commands.sell)) {

        reply = sell(player, text)
        savePlayers(players)

    } else if (text.includes(commands.about)) {

        // If there is replied message, then show the info of a player, whose message is replied
        if (msg.reply_to_message) {
            player = getPlayer(msg.reply_to_message.from, players)
        }

        reply = about(player)

    } else if (text.includes(commands.union)) {

        reply = `union()` // union(player, msg.text, unions)

    } else if (text.includes(commands.best)) {

        reply = best(players)

    } else if (text.includes(commands.give)) {

        if (!msg.reply_to_message) {
            reply = `<a href="tg://user?id=${player.id}">${player.name}</a>, please reply that user message, who you wish to give some money`
        } else {

            // Checking if user is banned to give someone money
            if (!banlist.includes(player.id)) {
                reply = give(player, getPlayer(msg.reply_to_message.from, players), text)
                savePlayers(players)
            } else {
                reply = `<a href="tg://user?id=${player.id}">${player.name}</a>, you are not allowed to give money`
            }

        }

    } else if (text.includes(commands.readme)) {

        reply = readme()

    } else if (text.includes(commands.rename)) {

        reply = rename(player, msg.text)

    } else if (text.includes(commands.start)) {

        reply = start()

    } else if (text.includes(commands.stats)) {

        reply = getStats(stats)

    } else if (text.includes(commands.ban)) {

        reply = ban(msg.reply_to_message, banlist)
        saveBanlist(banlist)

    }


    // If a player plays the game outside the chat the bot was created for, then warn him to play warbot there
    // Do not delete messages if it is another chat
    if (chatId != specialChatId && allCommands.includes(text) && !(text.includes(commands.start) || text.includes(commands.readme))) {
        reply += "\n\nPlay there: @nause121"
    }


    // Deleting message which contains command request
    deleteMessage(bot, chatId, msgId)
    if (!text.includes(commands.attack) && msg.chat.type != "private") {
        deleteMessage(bot, chatId, msgId + 1, 40)
    }

    // Sending reply message
    sendMessage(bot, chatId, reply)

    // Updating stats
    if (user.id != dev.id) {
        saveStats(++stats)
    }

})



// Updating budget. Bot calculates income every 15seconds
setInterval(function () {

    for (player of players) {
        player.budget += player.factories * econ.income
    }
    savePlayers(players)

}, 15 * 1000)

setTimeout(function () {

    updateCaptured(players)
    savePlayers(players)

    setInterval(function () {

        updateCaptured(players)
        savePlayers(players)

    }, 1 * 60 * 60 * 1000)

}, delayToNextHour())