// Import
const econ = require("./econ.json")
const { priceLayout, getItem } = require("./otherFunctions")
const { getPlayer } = require("./playerFunctions")

// Export
module.exports = { about, buy, sell, attack, give, start, readme, rename, union, best }



// Function to attack a player
function attack(player, victim) {

    // If victim has already been captured today, then cancel attack
    // If player has no units to attack with, then cancel attack
    if (victim.captured) {
        return `${victim.name} has been already captured. The state cannot be attacked more untill it is restored`
    } else if (player.forces < 1) {
        return `<a href="tg://user?id=${player.id}">${player.name}</a>, you don't have any attack forces`
    }

    // Calculating attack
    if (victim.forces < player.forces) {

        let diedForces = victim.forces
        let capturedFactories = Math.floor(victim.factories / 2)

        player.forces -= diedForces
        player.factories += capturedFactories

        victim.forces = 0
        victim.captured = true
        victim.factories -= capturedFactories

        if (victim.factories < 10) {
            victim.factories = 10
        }

        return `<a href="tg://user?id=${player.id}">${player.name}</a> has attacked <a href="tg://user?id=${victim.id}">${victim.name}</a>\n\n>Result: <b>SUCCESS</b>\n\n>Died: ${diedForces}\n>Factories: +${capturedFactories}`

    } else {

        let diedForces = player.forces

        victim.forces -= player.forces
        player.forces = 0

        return `<a href="tg://user?id=${player.id}">${player.name}</a> has attacked <a href="tg://user?id=${victim.id}">${victim.name}</a>\n\n>Result: <b>FAIL</b>\n\n>Died: ${diedForces}`

    }

}

// Function to buy soldiers or factory
function buy(player, text) {

    // Some predifinied variables
    let reply = `<a href="tg://user?id=${player.id}">${player.name}</a>`
    let sum = 0
    let num = 0
    let code = ""


    // Working with the text

    // Parsing the code
    if (/\/buy(@war121bot)? +for/.test(text)) {
        code = "for"
    } else if (/\/buy(@war121bot)? +fac/.test(text)) {
        code = "fac"
    } else {
        return `${reply}, incorrect command request. The correct request example:\n<code>/buy for all</code> || <code>/buy fac 10000</code>`
    }

    // Parsing the number
    if (/\/buy(@war121bot)? +(for|fac) +\d+k|к/.test(text)) {
        sum = parseInt(/\d+/.exec(text)[0]) * 1000
    } else if (/\/buy(@war121bot)? +(for|fac) +\d+/.test(text)) {
        sum = parseInt(/\d+/.exec(text)[0])
    } else if (/\/buy(@war121bot)? +(for|fac) +all/.test(text)) {
        sum = player.budget
    } else {
        return `${reply}, incorrect command request. The correct request example:\n<code>/buy att all</code> || <code>/buy att 10000</code>`
    }


    // Checking the sum of purchase
    if (sum > player.budget) {
        return `${reply}, you don't have ${priceLayout(sum)}\n>Budget: ${priceLayout(player.budget)}`
    } else if (code === "fac" && sum < econ.factoryPrice) {
        return `${reply}, the price of one factory is ${priceLayout(econ.factoryPrice)}\n>Budget: ${priceLayout(player.budget)}`
    } else if (sum < econ.soldierPrice) {
        return `${reply}, the price of one soldier is ${priceLayout(econ.soldierPrice)}\n>Budget: ${priceLayout(player.budget)}`
    } 

    // Marking purchase && renaming code
    switch (code) {
        case "fac":
            num = Math.floor(sum / econ.factoryPrice)
            player.factories += num
            player.budget -= Math.floor(num * econ.factoryPrice)
            code = "factories"
            break
        case "for":
            num = Math.floor(sum / econ.soldierPrice)
            player.forces += num
            player.budget -= Math.floor(num * econ.soldierPrice)
            code = "forces"
            break
    }


    // Returning the result
    return `${reply} has bought <b>${num}</b> ${code}`

}

// Function to sell soldiers or factories
function sell(player, text) {

    // Some predifinied variables
    let reply = `<a href="tg://user?id=${player.id}">${player.name}</a>`
    let num = 0
    let code = ""
    let fullCode = ""


    // Working with the text

    // Parsing the code
    if (/\/sell(@war121bot)? +for/.test(text)) {
        code = "for"
        fullCode = "forces"
    } else if (/\/sell(@war121bot)? +fac/.test(text)) {
        code = "fac"
        fullCode = "factories"
    } else {
        return `${reply}, incorrect command request. The correct request example:\n<code>/sell att all</code> || <code>/sell att 100</code>`
    }

    // Parsing the number
    if (/\/sell(@war121bot)? +(for|fac) +\d+k|к/.test(text)) {
        num = parseInt(/\d+/.exec(text)[0]) * 1000
    } else if (/\/sell(@war121bot)? +(for|fac) +\d+/.test(text)) {
        num = parseInt(/\d+/.exec(text)[0])
    } else if (/\/sell(@war121bot)? +(for|fac) +all/.test(text)) {
        num = getItem(code, player) 
    } else {
        return `${reply}, incorrect command request. The correct request example:\n<code>/sell att all</code> || <code>/sell att 100</code>`
    }


    // Checking the amount of items to sell
    if (num > getItem(code, player)) {
        return `${reply}, you don't have ${num} ${fullCode}`
    } else if (code === "fac" && player.factories <= 10) {
        return `${reply}, you cannot sell more factories`
    } else if (code === "fac" && player.factories - num < 10) {
        num = player.factories - 10
    }


    // Marking purchase && renaming code
    switch (code) {
        case "fac":
            player.factories -= num
            player.budget += Math.floor(num * econ.factoryPrice)
            break
        case "for":
            player.forces -= num
            player.budget += Math.floor(num * econ.soldierPrice)
            break
    }


    // Returning the result
    return `${reply} has sold <b>${num}</b> ${fullCode}`

}

// Function which returns player info in string format for output
function about(player) {
    return `<a href="tg://user?id=${player.id}">${player.name}</a>\nForces: <b>${player.forces}</b>\nFactories: <b>${player.factories}</b>\nBudget: <b>${priceLayout(player.budget)}</b>\nCaptured: <b>${player.captured ? "TRUE" : "FALSE"}</b>`
}

// Function to create or join the union
function union(player, text, unions) {

    // // Working with the text
    // let items = text.split(" ")
    // items.shift()

    // if (items.length === 0 && player.union) {
    //     // return printUnion()
    // } else if (items.length === 0 && !player.union) {
    //     // return `You are not in any alliance yet`
    // }



}

// Function to get top players
function best(players) {

    // Creating copy of players array to add a new parameter for sorting
    let playersCopy = []
    for(player of players) {
        playersCopy.push({id: player.id, power: player.factories * econ.factoryPrice + player.budget + player.forces * econ.soldierPrice})
    }

    // Sorting the player
    playersCopy.sort(function (a, b) {
        if (a.name > b.name) {
          return -1;
        }
        if (a.name < b.name) {
          return 1;
        }
        return 0;   
    })

    // Otput
    let reply = ``
    for (let i = 0; i < 5; i++) {
        if(playersCopy[i]) {
            let player = getPlayer({id: playersCopy[i].id}, players)
            reply += `${player.name}\n🏭${player.factories} 🪖${player.forces} 💰${priceLayout(player.budget)}\n\n`
        }
    } reply += ``

    return reply
}

// Function to support one player by another one with finance
function give(giver, recipient, text) {

    let param = null

    // Working with text and checking if the request is correct
    if (/\/give(@war121bot)? +\d{0,3}%/.test(text)) {
        param = (parseInt(/\d+/.exec(text)[0]) / 100) * giver.budget
    } else if (/\/give(@war121bot)? +\d+k|к/.test(text)) {
        param = parseInt(/\d+/.exec(text)[0]) * 1000
    } else if (/\/give(@war121bot)? +\d+/.test(text)) {
        param = parseInt(/\d+/.exec(text)[0])
    } else if (text === "/give all" || text === "/give@war121bot all") {
        param = giver.budget
    } else {
        return `<a href="tg://user?id=${giver.id}">${giver.name}</a>, incorrect request. Correct request example:\n<code>/give 1000</code> || <code>/give all</code>`
    }

    // Some exclusions 
    if (param > giver.budget && giver.budget >= 1) {
        return `<a href="tg://user?id=${giver.id}">${giver.name}</a>, wow, you are so generous! The problem is you don't have ${priceLayout(param)}. Your budget is ${priceLayout(giver.budget)} only`
    } else if (giver.budget < 1) {
        return `<a href="tg://user?id=${giver.id}">${giver.name}</a>, well, this is good deed, buy you don't have any money`
    }

    // If everything is okay, then calculate transaction
    giver.budget -= param
    recipient.budget += param

    return `<a href="tg://user?id=${giver.id}">${giver.name}</a>, you've supported <a href="tg://user?id=${recipient.id}">${recipient.name}</a> with ${priceLayout(param)}`

}

// Function to rename player
function rename(player, text) {

    // Declaring limits of max and min chars in the name
    let max = 28
    let min = 1

    // Working with the text
    let items = text.split(" ")
    items.shift()
    let newName = items.join(" ")

    // Checking for limits
    if (newName.length > max) {
        return `<a href="tg://user?id=${player.id}">${player.name}</a>, max characters: <b>${max}</b>`
    } else if (newName.length < min) {
        return `<a href="tg://user?id=${player.id}">${player.name}</a>, min characters: <b>${min}</b>`
    } else if (newName.includes("\n")) {
        return `<a href="tg://user?id=${player.id}">${player.name}</a>, using new line is forbidden`
    }

    // Changing name
    player.name = newName

    return `<a href="tg://user?id=${player.id}">${player.name}</a>, your name has been changed successfully`

}

// Functions of readme and start
function readme() {
    return `<a href="https://telegra.ph/war121-02-07">Gameplay & Update news</a>`
}
function start() {
    return `This is war game, which allows you to fight among chat members. Buy factories to earn more money, buy do not forget to get enough soldiers to defend your state\n\n*The game is created only for @nause121 chat`
}