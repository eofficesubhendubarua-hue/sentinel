// ============================================================
// SENTINEL Intelligence Brief — Live Telecast & Sports Engine
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initLiveStreamViewport();
    initFIFASimulator();
    initCricketSimulator();
});

// ─── Live News Stream Viewport Switcher ───────────────────
const LIVE_CHANNELS = {
    dw: {
        name: "DW News Global Feed",
        url: "https://www.youtube.com/embed/gCNeDWCI0To",
        badge: "DW LIVE"
    },
    aljazeera: {
        name: "Al Jazeera English Broadcast",
        url: "https://www.youtube.com/embed/bNyUyrR0PHo",
        badge: "AJE LIVE"
    },
    skynews: {
        name: "Sky News Live Stream",
        url: "https://www.youtube.com/embed/9AuqeyyFGBs",
        badge: "SKY LIVE"
    },
    france24: {
        name: "France 24 English Live",
        url: "https://www.youtube.com/embed/h3MuIUNywtI",
        badge: "F24 LIVE"
    },
    nasatv: {
        name: "NASA TV Spacecast",
        url: "https://www.youtube.com/embed/21X5lGlDOfg",
        badge: "NASA LIVE"
    }
};

function initLiveStreamViewport() {
    const iframe = document.getElementById("live-stream-viewport");
    if (!iframe) return;

    // Set default channel (Al Jazeera English)
    switchBroadcastChannel("aljazeera");

    // Start fluctuating telemetry metadata
    setInterval(updateStreamTelemetry, 3000);
}

function switchBroadcastChannel(channelId) {
    const channel = LIVE_CHANNELS[channelId];
    if (!channel) return;

    const iframe = document.getElementById("live-stream-viewport");
    const titleEl = document.getElementById("active-stream-title");
    const badgeEl = document.getElementById("active-stream-badge");

    if (iframe) iframe.src = channel.url;
    if (titleEl) titleEl.textContent = channel.name;
    if (badgeEl) badgeEl.textContent = channel.badge;

    // Toggle active state on buttons
    document.querySelectorAll(".stream-chip").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.channel === channelId);
    });
}

// Make it global so HTML onclick attributes can access it
window.switchBroadcastChannel = switchBroadcastChannel;

function updateStreamTelemetry() {
    const bitRateEl = document.getElementById("telemetry-bitrate");
    const latencyEl = document.getElementById("telemetry-latency");
    const packetEl = document.getElementById("telemetry-packet-loss");

    if (bitRateEl) {
        const val = (4.4 + Math.random() * 0.5).toFixed(2);
        bitRateEl.textContent = val + " Gb/s";
    }
    if (latencyEl) {
        const val = Math.floor(10 + Math.random() * 8);
        latencyEl.textContent = val + " ms";
    }
    if (packetEl) {
        const val = Math.random() < 0.8 ? "0.00%" : (Math.random() * 0.02).toFixed(4) + "%";
        packetEl.textContent = val;
    }
}


// ─── FIFA World Cup 2026 Live Arena Simulator ─────────────
let fifaState = {
    minute: 74,
    scoreHome: 2,
    scoreAway: 1,
    teamHome: "USA",
    teamAway: "GERMANY",
    scorersHome: ["C. Pulisic 12'", "B. Aaronson 58'"],
    scorersAway: ["K. Havertz 34'"],
    homePossession: 51,
    homeShots: 9,
    awayShots: 11
};

const FIFA_COMMENTARY_FALLBACKS = [
    "Germany maintains heavy pressure in the final third. Musiala trying to weave through the US backline.",
    "USA wins a throw-in near the corner flag. Pulisic shielding the ball well.",
    "A stunning sliding tackle by McKennie stops Wirtz in his tracks. Tremendous defensive work rate!",
    "Great save by Turner! Havertz fires a volley from the edge of the box, tipped over the crossbar.",
    "USA breaking on a counter! Weah sprints down the right flank but Rudiger slide tackles cleanly.",
    "Germany looking fatigued in midfield. Kimmich trying to direct play with long diagonal passes.",
    "Foul by Gundogan on Musah in the center circle. Referee issues a verbal warning.",
    "Yellow Card! Dest gets booked for delaying the restart of play.",
    "USA substitution: Reyna comes on for Aaronson to consolidate the attacking midfield."
];

function initFIFASimulator() {
    updateFIFADisplay();
    
    // Add initial commentary line
    addFIFACommentary("Match synchronized with satellite feeds. Weather: Clear, 22°C. Stadium: MetLife Stadium, New Jersey.");

    // Advance match minute every 6 seconds
    setInterval(() => {
        fifaState.minute++;
        
        if (fifaState.minute > 90) {
            // Reset match for continuous simulation
            fifaState.minute = 0;
            fifaState.scoreHome = 0;
            fifaState.scoreAway = 0;
            fifaState.scorersHome = [];
            fifaState.scorersAway = [];
            addFIFACommentary("⚽ Referee blows the whistle! A brand new FIFA World Cup 2026 simulation begins.");
        } else {
            // Check for potential goal events (3% chance per minute)
            const roll = Math.random();
            if (roll < 0.03) {
                // Goal USA!
                fifaState.scoreHome++;
                const goalscorer = getRandomUSAname() + ` ${fifaState.minute}'`;
                fifaState.scorersHome.push(goalscorer);
                addFIFACommentary(`⚽ GOAL!!! ${fifaState.teamHome} score! A magnificent strike into the top corner by ${goalscorer}! USA fans erupt!`);
            } else if (roll < 0.055) {
                // Goal Germany!
                fifaState.scoreAway++;
                const goalscorer = getRandomGERname() + ` ${fifaState.minute}'`;
                fifaState.scorersAway.push(goalscorer);
                addFIFACommentary(`⚽ GOAL!!! ${fifaState.teamAway} score! ${goalscorer} taps it in from close range after a rebound!`);
            } else {
                // Regular match play commentary
                const comment = FIFA_COMMENTARY_FALLBACKS[Math.floor(Math.random() * FIFA_COMMENTARY_FALLBACKS.length)];
                addFIFACommentary(`[${fifaState.minute}'] ${comment}`);
            }
        }

        // Fluctuate stats
        fifaState.homePossession = Math.max(40, Math.min(60, fifaState.homePossession + (Math.random() < 0.5 ? -1 : 1)));
        if (Math.random() < 0.1) fifaState.homeShots++;
        if (Math.random() < 0.1) fifaState.awayShots++;

        updateFIFADisplay();
    }, 6000);
}

function updateFIFADisplay() {
    const timeEl = document.getElementById("fifa-time");
    const scoreEl = document.getElementById("fifa-score");
    const homeScorersEl = document.getElementById("fifa-scorers-home");
    const awayScorersEl = document.getElementById("fifa-scorers-away");
    const statsPossEl = document.getElementById("fifa-stat-possession");
    const statsShotsEl = document.getElementById("fifa-stat-shots");

    if (timeEl) timeEl.textContent = fifaState.minute + "'";
    if (scoreEl) scoreEl.textContent = `${fifaState.teamHome} ${fifaState.scoreHome} - ${fifaState.scoreAway} ${fifaState.teamAway}`;
    if (homeScorersEl) homeScorersEl.innerHTML = fifaState.scorersHome.map(s => `<span>${s}</span>`).join("<br>");
    if (awayScorersEl) awayScorersEl.innerHTML = fifaState.scorersAway.map(s => `<span>${s}</span>`).join("<br>");
    if (statsPossEl) statsPossEl.textContent = `POSSESSION: ${fifaState.homePossession}% - ${100 - fifaState.homePossession}%`;
    if (statsShotsEl) statsShotsEl.textContent = `SHOTS ON TARGET: ${fifaState.homeShots} - ${fifaState.awayShots}`;
}

function addFIFACommentary(text) {
    const list = document.getElementById("fifa-commentary-list");
    if (!list) return;

    const li = document.createElement("div");
    li.className = "commentary-item";
    li.innerHTML = `<span class="commentary-time">[${new Date().toLocaleTimeString('en-IN', { hour12: false })}]</span> ${text}`;
    list.prepend(li);

    // Limit log size to 30 items
    if (list.children.length > 30) {
        list.removeChild(list.lastChild);
    }
}

function getRandomUSAname() {
    const names = ["F. Balogun", "T. Weah", "G. Reyna", "Y. Musah", "W. McKennie", "C. Richards"];
    return names[Math.floor(Math.random() * names.length)];
}

function getRandomGERname() {
    const names = ["L. Sane", "F. Wirtz", "J. Musiala", "N. Fullkrug", "T. Muller", "I. Gundogan"];
    return names[Math.floor(Math.random() * names.length)];
}


// ─── Live Cricket Match Simulator (IND vs AUS) ─────────────
let cricketState = {
    runs: 254,
    wickets: 4,
    overs: 39,
    ballsInOver: 2,
    target: 298,
    batsman1: { name: "Rishabh Pant", runs: 42, balls: 36, fours: 3, sixes: 1 },
    batsman2: { name: "Hardik Pandya", runs: 18, balls: 14, fours: 1, sixes: 1 },
    bowler: { name: "Mitchell Starc", overs: 8, maidens: 0, runs: 56, wickets: 2, balls: 2 },
    lastBalls: ["1", "4", "0", "6", "Wd", "1"]
};

const CRICKET_BALLS_COMMENTARY = [
    "Starc pitches it full outside off, driven straight to mid-off. No run.",
    "Short delivery by Starc, Pant pulls it away to deep square leg for a single.",
    "Starc to Pandya, beats him on the outside edge! Terrific swing away from the right-hander.",
    "Full toss, Pandya pushes it to mid-on and quickly steals a quick single.",
    "Starc goes wide of the crease, Pant lets it go. Dot ball.",
    "Angled into the pads, tucked away to fine leg for a couple of runs."
];

function initCricketSimulator() {
    updateCricketDisplay();
    addCricketCommentary("System synced with MCG broadcast node. India needs 44 runs to win from 64 balls.");

    setInterval(() => {
        // Increment ball
        cricketState.ballsInOver++;
        cricketState.bowler.balls++;
        if (cricketState.ballsInOver > 5) {
            cricketState.ballsInOver = 0;
            cricketState.overs++;
            cricketState.bowler.overs++;
            cricketState.bowler.balls = 0;
        }

        // Generate outcome: 0, 1, 2, 4, 6, W, Wd
        const roll = Math.random();
        let outcome = "0";
        let commentText = "";

        if (roll < 0.4) {
            outcome = "1";
            cricketState.runs += 1;
            cricketState.batsman2.runs += 1;
            cricketState.batsman2.balls += 1;
            commentText = "Starc to Pandya, 1 run, pushed to deep cover for a single.";
            // Swap batsmen on single
            const temp = cricketState.batsman1;
            cricketState.batsman1 = cricketState.batsman2;
            cricketState.batsman2 = temp;
        } else if (roll < 0.6) {
            outcome = "0";
            cricketState.batsman2.balls += 1;
            commentText = CRICKET_BALLS_COMMENTARY[Math.floor(Math.random() * CRICKET_BALLS_COMMENTARY.length)];
        } else if (roll < 0.72) {
            outcome = "4";
            cricketState.runs += 4;
            cricketState.batsman2.runs += 4;
            cricketState.batsman2.balls += 1;
            cricketState.batsman2.fours += 1;
            commentText = `FOUR! Beautifully timed! ${cricketState.batsman2.name} plays a gorgeous cover drive past extra cover for boundary!`;
        } else if (roll < 0.8) {
            outcome = "2";
            cricketState.runs += 2;
            cricketState.batsman2.runs += 2;
            cricketState.batsman2.balls += 1;
            commentText = `Starc to ${cricketState.batsman2.name}, 2 runs, flicked off the pads down to deep mid-wicket for a couple.`;
        } else if (roll < 0.88) {
            outcome = "6";
            cricketState.runs += 6;
            cricketState.batsman2.runs += 6;
            cricketState.batsman2.balls += 1;
            cricketState.batsman2.sixes += 1;
            commentText = `SIX!!! Massive! ${cricketState.batsman2.name} lofts Starc high over long-on for a gigantic six into the crowd!`;
        } else if (roll < 0.94) {
            outcome = "W";
            cricketState.wickets++;
            cricketState.bowler.wickets++;
            commentText = `💥 OUT!!! Clean bowled! Starc delivers a searing yorker at 148 km/h. ${cricketState.batsman2.name} is completely beaten and the off-stump goes cartwheeling!`;
            // Get new batsman
            cricketState.batsman2 = {
                name: getRandomBatsmanName(),
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0
            };
        } else {
            outcome = "Wd";
            cricketState.runs += 1;
            cricketState.bowler.runs += 1;
            commentText = "Starc delivers a wide down the leg side. Wd.";
            // Wide doesn't count as a legal ball, revert ball increment
            cricketState.ballsInOver--;
            cricketState.bowler.balls--;
            if (cricketState.ballsInOver < 0) {
                cricketState.ballsInOver = 5;
                cricketState.overs--;
                cricketState.bowler.overs--;
            }
        }

        if (outcome !== "Wd") {
            cricketState.bowler.runs += (outcome === "W" ? 0 : parseInt(outcome) || 0);
        }

        // Add to last balls tracking
        cricketState.lastBalls.push(outcome);
        if (cricketState.lastBalls.length > 6) {
            cricketState.lastBalls.shift();
        }

        // Add commentary line
        const ballDisplay = `${cricketState.overs}.${cricketState.ballsInOver}`;
        addCricketCommentary(`[Ball ${ballDisplay}] ${commentText}`);

        // Check for match end condition
        if (cricketState.runs >= cricketState.target) {
            addCricketCommentary("🏆 INDIA WINS! Risbhabh Pant hits the winning runs. Sensational run chase!");
            cricketState.runs = 140;
            cricketState.wickets = 2;
            cricketState.overs = 20;
            cricketState.ballsInOver = 0;
            cricketState.batsman1.runs = 12;
            cricketState.batsman2.runs = 8;
        }

        updateCricketDisplay();
    }, 6000);
}

function updateCricketDisplay() {
    const scoreEl = document.getElementById("cricket-score");
    const oversEl = document.getElementById("cricket-overs");
    const targetEl = document.getElementById("cricket-target");
    
    const b1Name = document.getElementById("cricket-b1-name");
    const b1Runs = document.getElementById("cricket-b1-runs");
    const b1Balls = document.getElementById("cricket-b1-balls");
    const b1Fours = document.getElementById("cricket-b1-fours");
    const b1Sixes = document.getElementById("cricket-b1-sixes");

    const b2Name = document.getElementById("cricket-b2-name");
    const b2Runs = document.getElementById("cricket-b2-runs");
    const b2Balls = document.getElementById("cricket-b2-balls");
    const b2Fours = document.getElementById("cricket-b2-fours");
    const b2Sixes = document.getElementById("cricket-b2-sixes");

    const bowlName = document.getElementById("cricket-bowl-name");
    const bowlOvers = document.getElementById("cricket-bowl-overs");
    const bowlRuns = document.getElementById("cricket-bowl-runs");
    const bowlWkts = document.getElementById("cricket-bowl-wkts");

    const trendEl = document.getElementById("cricket-balls-trend");

    if (scoreEl) scoreEl.textContent = `IND ${cricketState.runs} / ${cricketState.wickets}`;
    if (oversEl) oversEl.textContent = `OVERS: ${cricketState.overs}.${cricketState.ballsInOver} / 50.0`;
    if (targetEl) targetEl.textContent = `TARGET: ${cricketState.target} (Need ${cricketState.target - cricketState.runs} runs to win)`;

    if (b1Name) b1Name.textContent = cricketState.batsman1.name + "*";
    if (b1Runs) b1Runs.textContent = cricketState.batsman1.runs;
    if (b1Balls) b1Balls.textContent = cricketState.batsman1.balls;
    if (b1Fours) b1Fours.textContent = cricketState.batsman1.fours;
    if (b1Sixes) b1Sixes.textContent = cricketState.batsman1.sixes;

    if (b2Name) b2Name.textContent = cricketState.batsman2.name;
    if (b2Runs) b2Runs.textContent = cricketState.batsman2.runs;
    if (b2Balls) b2Balls.textContent = cricketState.batsman2.balls;
    if (b2Fours) b2Fours.textContent = cricketState.batsman2.fours;
    if (b2Sixes) b2Sixes.textContent = cricketState.batsman2.sixes;

    if (bowlName) bowlName.textContent = cricketState.bowler.name;
    if (bowlOvers) bowlOvers.textContent = `${cricketState.bowler.overs}.${cricketState.bowler.balls}`;
    if (bowlRuns) bowlRuns.textContent = cricketState.bowler.runs;
    if (bowlWkts) bowlWkts.textContent = cricketState.bowler.wickets;

    if (trendEl) {
        trendEl.innerHTML = cricketState.lastBalls.map(b => {
            let cls = "";
            if (b === "4" || b === "6") cls = "cricket-trend-boundary";
            if (b === "W") cls = "cricket-trend-wicket";
            return `<span class="trend-ball ${cls}">${b}</span>`;
        }).join("");
    }
}

function addCricketCommentary(text) {
    const list = document.getElementById("cricket-commentary-list");
    if (!list) return;

    const li = document.createElement("div");
    li.className = "commentary-item";
    li.innerHTML = `<span class="commentary-time">[${new Date().toLocaleTimeString('en-IN', { hour12: false })}]</span> ${text}`;
    list.prepend(li);

    if (list.children.length > 30) {
        list.removeChild(list.lastChild);
    }
}

function getRandomBatsmanName() {
    const names = ["Ravindra Jadeja", "Axar Patel", "Kuldeep Yadav", "Jasprit Bumrah", "Mohammed Siraj", "Arshdeep Singh"];
    return names[Math.floor(Math.random() * names.length)];
}
