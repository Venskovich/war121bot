// Import
const { getName } = require("./otherFunctions")

// Export
module.exports = { getPlayer, updateCaptured }




// Function to create player
function createPlayer(user, players) {

    // Creating new player object
    let newPlayer = {
        id: user.id,
        name: getName(user),
        forces: 200,
        budget: 10000,
        factories: 10,
        captured: false,
        union: null
    }

    // Pushing the newPlayer
    players.push(newPlayer)

    // Return the player
    return newPlayer

}

// Function which finds player by userId and returns it
function getPlayer(user, players) {

    for (player of players) {
        if (player.id === user.id) {
            return player
        }
    }

    return createPlayer(user, players)

}

// Function to update captured status for all players
function updateCaptured(players) {

    for (player of players) {
        player.captured = false
    }

}