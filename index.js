function rollDie() {
    return Math.floor(6 * Math.random()) + 1;
}

function getNumberValue(name) {
    return parseInt(document.querySelector(`#${name}`).value);
}

function maybeS(count, suffix) {
    return count === 1 ? "" : suffix;
}

const players = [];

function roll() {
    const selfCount = getNumberValue("self");

    const selfResults = [];
    for (let i = 0; i < selfCount; ++i) {
        selfResults.push(rollDie());
    }

    const diceByPlayer = [];
    for (let i = 0; i < players.length; ++i) {
        const playerDice = []
        for (let d = 0; d < getNumberValue(`player${i}`); ++d) {
            playerDice.push(rollDie());
        }
        diceByPlayer.push(playerDice);
    }

    let results = "<div class=\"dice-results\">";
    for (const result of selfResults) {
        results += `<span class="self dice-result">${result}</span>`;
    }
    for (let i = 0; i < players.length; ++i) {
        for (const result of diceByPlayer[i]) {
            results += `<span class="player${i} dice-result">${result}</span>`;
        }
    }
    results += "</div>"; // dice-results
    const critFailures = selfResults.filter(d => d === 1).length;
    if (critFailures > 0) {
        results += `<div class="outcome">${critFailures} crit failure${maybeS(critFailures, "s")} on own dice.</div>`;
    }
    const critSuccesses = diceByPlayer.flat().filter(d => d === 6).length;
    if (critSuccesses > 0) {
        results += `<div class="outcome">${critSuccesses} crit success${maybeS(critSuccesses, "es")} on other players' dice.</div>`;
    }

    const levelsToResults = {
        0: ["Take minor fallout but nothing else happens", "Take major fallout and the test succeeds"],
        1: ["Nothing happens", "Fail forward + fallout"],
        2: ["Success"],
        3: ["Success", "Crit success + fallout"],
        4: ["Crit success", "Success + bank a success for later"],
    }
    
    const totalSuccesses = selfResults.filter(d => d >= 4).length + diceByPlayer.flat().filter(d => d >= 4).length;
    results += `<div class="outcome">Total success${maybeS(totalSuccesses, "es")}: ${totalSuccesses}</div>`;
    let level;
    if (totalSuccesses >= 6) {
        level = 4;
    } else if (totalSuccesses >= 4) {
        level = 3;
    } else if (totalSuccesses >= 3) {
        level = 2;
    } else if (totalSuccesses >= 1) {
        level = 1;
    } else {
        level = 0;
    }
    level = Math.max(0, level + getNumberValue("difficulty"));
    results += `<div class="outcome">Outcome${maybeS(levelsToResults[level].length, "s")}: ${levelsToResults[level].join(" OR ")}</div>`;

    document.getElementById("results").innerHTML = results;
}

const rollButton = document.querySelector("#roll-button");
rollButton.addEventListener("click", roll);

function addPlayer() {
    const name = window.prompt("Player name");
    if (!name) {
        return;
    }
    if (players.includes(name)) {
        alert(`Player ${name} already exists`);
    } else {
        let index = players.length;
        players.push(name);
        const additionalPlayersElement = document.getElementById("additional-players");

        const label = document.createElement("label");
        label.setAttribute("for", `player${index}`);
        label.setAttribute("class", `player${index}`);
        label.innerHTML = name;
        additionalPlayersElement.appendChild(label);

        const input = document.createElement("input");
        input.setAttribute("id", `player${index}`);
        input.setAttribute("name", `player${index}`);
        input.setAttribute("type", "number");
        input.setAttribute("value", "0");
        additionalPlayersElement.appendChild(input);
    }
}

const addPlayerButton = document.querySelector("#add-player");
addPlayerButton.addEventListener("click", addPlayer);