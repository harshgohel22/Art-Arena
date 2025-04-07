// Retrieve player information from localStorage
const playerName = localStorage.getItem("playerName");
const selectedCharacter = localStorage.getItem("selectedCharacter");

// Listen for the updated player list from the server
socket.on("updatePlayerList", (players) => {
    const playerList = document.querySelector(".left-panel ul");
    if (!playerList) {
        // If the leaderboard container doesn't exist, create it
        const ul = document.createElement("ul");
        document.querySelector(".left-panel").appendChild(ul);
    }

    playerList.innerHTML = ""; // Clear the current list

    players.forEach((player) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${player.character}" class="avatar"> 
            ${player.name}`;
        playerList.appendChild(listItem);
    });
});
