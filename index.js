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

let rollState = null;

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

    rollState = {
        selfResults: selfResults,
        diceByPlayer: diceByPlayer,
    };

    renderResult();
}

function renderResult() {
    if (rollState === null) {
        return;
    }

    let results = "<div class=\"dice-results\">";
    for (const result of rollState.selfResults) {
        results += `<span class="self dice-result">${result}</span>`;
    }
    for (let i = 0; i < players.length; ++i) {
        for (const result of rollState.diceByPlayer[i]) {
            results += `<span class="player${i} dice-result">${result}</span>`;
        }
    }
    results += "</div>"; // dice-results
    const critFailures = rollState.selfResults.filter(d => d === 1).length;
    if (critFailures > 0) {
        results += `<div class="outcome">${critFailures} crit failure${maybeS(critFailures, "s")} on own dice.</div>`;
    }
    const otherPlayerSixes = rollState.diceByPlayer.flat().filter(d => d === 6).length;
    const critSuccesses = Math.floor(otherPlayerSixes / 2);
    if (critSuccesses > 0) {
        results += `<div class="outcome">${critSuccesses} crit success${maybeS(critSuccesses, "es")} on other players' dice.</div>`;
    }

    const levelsToResults = {
        0: ["Take minor fallout but nothing else happens", "Take major fallout and the test succeeds"],
        1: ["Nothing happens", "Fail forward + fallout"],
        2: ["Success"],
        3: ["Success", "Crit success + fallout"],
        4: ["Crit success", "Success plus narrative boon"],
    }

    const difficulty = getNumberValue("difficulty");
    // If increase-threshold, each difficulty step increases the needed roll by 1 for a success (and monstrous discounts own dice completely).
    // If increase-level, each difficulty step worsens the outcome chart by one.
    const difficultyMode = document.querySelector("#difficulty-mode").value;
    const successThreshold = Math.min(6, 4 - (difficultyMode === "increase-threshold" ? difficulty : 0));

    const effectiveSelfSuccesses = difficultyMode === "increase-threshold" && difficulty === -3 ? 0 : rollState.selfResults.filter(d => d >= successThreshold).length;
    
    const totalSuccesses = effectiveSelfSuccesses + rollState.diceByPlayer.flat().filter(d => d >= successThreshold).length;
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
    level = Math.max(0, level + (difficultyMode === "increase-level" ? getNumberValue("difficulty") : 0));
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

document.querySelector("#difficulty-mode").addEventListener("change", renderResult);