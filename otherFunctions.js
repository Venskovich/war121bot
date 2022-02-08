// Import
const fs = require("fs")

// Export
module.exports = { sendMessage, deleteMessage, saveBanlist, savePlayers, saveStats, getName, priceLayout, isRequest, getItem, delayToNextHour }



// Function to get soldiers of factory
function getItem(code, player) {

    if (code === "fac") {
        return player.factories
    } else if (code === "for") {
        return player.forces
    }

}

// Function which checks whether text contains bot commands
function isRequest(allCommands, text) {
    
    for (command of allCommands) {
        if (text.includes(command)) {
            return true
        }
    }

    return false

}

// Function to layout price output, so 1000 will output as $1,000
function priceLayout(price) {

    // Some operations with price to make it array by string symbols
    price = Math.floor(price)
    price = price.toString()
    price = price.split("")

    // The layouted price first will be written as symbols array and secondly as string to output
    let newPriceArray = []
    let newPriceString = ""

    // Creating layouted price with comas as symbols array
    for (let i = 0; i < price.length; i++) {
        if (i % 3 == 0 && i != 0) {
            newPriceArray.unshift(",")
        }
        newPriceArray.unshift(price[price.length - 1 - i])
    }

    // Converting symbol array of layouted price to simple string
    for (symbol of newPriceArray) {
        newPriceString += symbol
    }

    // Returning price with dollar sign
    return `$${newPriceString}`

}

// Function to get user name
function getName(user) {

    // Checking if first_name and last_name are set by user
    // If user has no name, then his player name is initialized as "Player"
    if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`
    } else if (user.first_name) {
        return `${user.first_name}`
    } else if (user.last_name) {
        return `${user.last_name}`
    } else {
        return `Player`
    }

}

// This function is simplified form of bot.sendMessage()
function sendMessage(bot, chatId, text) {
    bot.sendMessage(chatId, text, { parse_mode: "HTML" })
}

// Function to delete appropriate message
function deleteMessage(bot, chatId, msgId, delay = 1) {

    setTimeout(function () {
        bot.deleteMessage(chatId, msgId)
    }, delay * 1000)

}

// Function to calculate time left to midnight
function delayToNextHour() {

    let thisDay = new Date()
    let nextDay = new Date()

    nextDay.setHours(thisDay.getHours() + 1,0,0,0)

    return nextDay.getTime() - thisDay.getTime()
    
}

// Functions to save data
function saveBanlist(banlist) {
    fs.writeFile("banlist.json", JSON.stringify(banlist), err => {
        if (err) throw err;
    });
}
function saveStats(stats) {
    fs.writeFile("stats.json", JSON.stringify(stats), err => {
        if (err) throw err;
    });
}
function savePlayers(players) {
    fs.writeFile("players.json", JSON.stringify(players), err => {
        if (err) throw err;
    });
}