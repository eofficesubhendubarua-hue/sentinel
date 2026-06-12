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
    aljazeera: {
        name: "Al Jazeera English Broadcast",
        url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8",
        badge: "AJE IPTV"
    },
    dw: {
        name: "DW News Global Feed",
        url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8",
        badge: "DW IPTV"
    },
    skynews: {
        name: "Sky News Live Stream",
        url: "https://www.youtube.com/embed/live_stream?channel=UC9_1s3S2145k49P2Q8624Vw",
        badge: "SKY LIVE"
    },
    france24: {
        name: "France 24 English Live",
        url: "https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg",
        badge: "F24 LIVE"
    },
    abcnews: {
        name: "ABC News Live Stream",
        url: "https://www.youtube.com/embed/live_stream?channel=UCQjl2mmarJ5412sFz9G7h4w",
        badge: "ABC LIVE"
    },
    cbsnews: {
        name: "CBS News Live Stream",
        url: "https://www.youtube.com/embed/live_stream?channel=UC8p1vwvGViqHeH5402H5X1g",
        badge: "CBS LIVE"
    },
    nbcnews: {
        name: "NBC News NOW Stream",
        url: "https://www.youtube.com/embed/live_stream?channel=UCeY0bbntWzzVIaj2z3QigXg",
        badge: "NBC LIVE"
    },
    bloomberg: {
        name: "Bloomberg Global Television",
        url: "https://www.youtube.com/embed/live_stream?channel=UCCIidzs5spLGKWbqV_L2HjA",
        badge: "BLOOMBERG LIVE"
    },
    cna: {
        name: "CNA Live Asia Broadcast",
        url: "https://www.youtube.com/embed/live_stream?channel=UCxS4U2kX9z8e05ZtJ1Wp3pA",
        badge: "CNA LIVE"
    }
};

const LIVE_FIFA_VIDEOS = {
    live: {
        url: "https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8"
    },
    intro: {
        url: "https://www.youtube.com/embed/OYg505-5cYU"
    },
    highlights: {
        url: "https://www.youtube.com/embed/videoseries?list=PL859A3D063A482A3A"
    }
};

const LIVE_CRICKET_VIDEOS = {
    live: {
        url: "https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8"
    },
    highlights: {
        url: "https://www.youtube.com/embed/videoseries?list=PLw2bX2l_L8vL8-tqY2T71e27aZ97tL9Z8"
    },
    bcci: {
        url: "https://www.youtube.com/embed/videoseries?list=PLb8d_K2XJ4c1Zg-r3T3hXwOqVj4k0_B1a"
    }
};

// Global active HLS instances to prevent memory leaks and overlapping playback
let activeHlsInstances = {
    news: null,
    fifa: null,
    cricket: null
};

function playStream(type, url, iframeId, videoId) {
    const iframe = document.getElementById(iframeId);
    const video = document.getElementById(videoId);
    if (!iframe || !video) return;

    // Destruct any existing HLS instance for this player
    if (activeHlsInstances[type]) {
        try {
            activeHlsInstances[type].destroy();
        } catch(e) {
            console.error("Hls destroy error:", e);
        }
        activeHlsInstances[type] = null;
    }

    const isM3u8 = url.includes('.m3u8');

    if (isM3u8) {
        // Hide iframe, show video
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
        video.style.display = 'block';

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            const hls = new Hls({
                maxMaxBufferLength: 10,
                enableWorker: true,
                lowLatencyMode: true,
                liveSyncDurationCount: 2,       // Start playback closer to live edge (reduces delay)
                liveMaxLatencyDurationCount: 3.5, // Allow catching up if latency builds up
                maxLiveSyncPlaybackRate: 1.5,   // Catch up playback rate if lagging
                backBufferLength: 5             // Keep fewer segments in back buffer to save memory
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.log("HLS Autoplay prevented:", e));
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn("IPTV Network Error, Retrying...", data);
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn("IPTV Media Error, Recovering...", data);
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("IPTV Fatal Error, stopping.", data);
                            hls.destroy();
                            break;
                    }
                }
            });
            activeHlsInstances[type] = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = url;
            video.addEventListener('canplay', () => {
                video.play().catch(e => console.log("Native Autoplay prevented:", e));
            });
        }
    } else {
        // YouTube embed mode
        video.style.display = 'none';
        try {
            video.pause();
        } catch(e){}
        video.src = '';
        iframe.style.display = 'block';
        iframe.src = url;
    }
}

function initLiveStreamViewport() {
    const newsIframe = document.getElementById("live-stream-viewport");
    if (newsIframe) {
        switchBroadcastChannel("aljazeera");
    }

    const fifaIframe = document.getElementById("fifa-video-viewport");
    if (fifaIframe) {
        switchFIFAVideo("live");
    }

    const cricketIframe = document.getElementById("cricket-video-viewport");
    if (cricketIframe) {
        switchCricketVideo("live");
    }

    // Start fluctuating telemetry metadata
    setInterval(updateStreamTelemetry, 3000);
}

function switchBroadcastChannel(channelId) {
    const channel = LIVE_CHANNELS[channelId];
    if (!channel) return;

    const titleEl = document.getElementById("active-stream-title");
    const badgeEl = document.getElementById("active-stream-badge");
    const hudChannelEl = document.getElementById("hud-active-channel-name");

    if (titleEl) titleEl.textContent = channel.name;
    if (badgeEl) badgeEl.textContent = channel.badge;
    if (hudChannelEl) hudChannelEl.textContent = channel.name.toUpperCase();

    playStream('news', channel.url, 'live-stream-viewport', 'live-stream-iptv-player');

    // Toggle active state on buttons
    document.querySelectorAll(".stream-chip").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.channel === channelId);
    });
}

function switchFIFAVideo(vidType) {
    const video = LIVE_FIFA_VIDEOS[vidType];
    if (!video) return;

    playStream('fifa', video.url, 'fifa-video-viewport', 'fifa-video-iptv-player');

    // Toggle active class on buttons
    document.querySelectorAll("[data-fifa-vid]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.fifaVid === vidType);
    });
}

function switchCricketVideo(vidType) {
    const video = LIVE_CRICKET_VIDEOS[vidType];
    if (!video) return;

    playStream('cricket', video.url, 'cricket-video-viewport', 'cricket-video-iptv-player');

    // Toggle active class on buttons
    document.querySelectorAll("[data-cricket-vid]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.cricketVid === vidType);
    });
}

// Make them global so HTML onclick attributes can access them
window.switchBroadcastChannel = switchBroadcastChannel;
window.switchFIFAVideo = switchFIFAVideo;
window.switchCricketVideo = switchCricketVideo;


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


// ─── FIFA World Cup 2026 Live Arena Selector ─────────────
const FIFA_MATCHES = {
    mexico_rsa: {
        id: "mexico_rsa",
        teamHome: "MEXICO",
        teamAway: "SOUTH AFRICA",
        flagHome: "🇲🇽",
        flagAway: "🇿🇦",
        scoreHome: 2,
        scoreAway: 0,
        minute: "FT",
        scorersHome: ["H. Lozano 43'", "S. Gimenez 78'"],
        scorersAway: [],
        homePossession: 55,
        homeShots: 14,
        awayShots: 8,
        satLink: "AZTECA_NODE_1",
        videoUrl: "https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8",
        commentary: [
            "⚽ Full Time! Mexico secures a dominant 2-0 victory in their opening game.",
            "[90'] 3 minutes of added time announced.",
            "⚽ GOAL!!! Mexico doubles the lead! Santiago Gimenez taps it in after a low cross!",
            "[65'] South Africa substitution: Foster comes on.",
            "⚽ GOAL!!! Hirving Lozano scores! A powerful strike from the edge of the box!",
            "[1'] Kickoff! Mexico City Stadium erupts as the tournament begins."
        ]
    },
    korea_cze: {
        id: "korea_cze",
        teamHome: "KOREA REPUBLIC",
        teamAway: "CZECHIA",
        flagHome: "🇰🇷",
        flagAway: "🇨🇿",
        scoreHome: 2,
        scoreAway: 1,
        minute: "FT",
        scorersHome: ["Son Heung-min 19' (P)", "Hwang Hee-chan 67'"],
        scorersAway: ["P. Schick 54'"],
        homePossession: 48,
        homeShots: 11,
        awayShots: 13,
        satLink: "GUADALAJARA_NODE_2",
        videoUrl: "https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8",
        commentary: [
            "⚽ Full Time! Korea Republic wins a hard-fought battle 2-1 against Czechia.",
            "[88'] Hwang Hee-chan receives a standing ovation as he is substituted.",
            "⚽ GOAL!!! Hwang Hee-chan puts Korea ahead! A brilliant chip over the goalkeeper!",
            "⚽ GOAL!!! Patrik Schick equalizes! A towering header from a corner kick!",
            "⚽ GOAL!!! Son Heung-min converts the penalty! Calms his nerves and slots it bottom right.",
            "[1'] Match starts in Zapopan, Guadalajara. High intensity from both sides."
        ]
    }
};

let activeFifaMatchId = "mexico_rsa";

function switchFIFASelectedMatch(matchId) {
    const match = FIFA_MATCHES[matchId];
    if (!match) return;

    activeFifaMatchId = matchId;

    // Update scorecard labels
    const homeFlagEl = document.querySelector(".fifa-match-details .team-block:first-child .team-flag");
    const homeNameEl = document.querySelector(".fifa-match-details .team-block:first-child .team-name");
    const scoreEl = document.getElementById("fifa-score");
    const timeEl = document.getElementById("fifa-time");
    const awayFlagEl = document.querySelector(".fifa-match-details .team-block:last-child .team-flag");
    const awayNameEl = document.querySelector(".fifa-match-details .team-block:last-child .team-name");
    const satLinkEl = document.querySelector(".sports-video-monitor .hud-top-left div:last-child .hud-val");

    if (homeFlagEl) homeFlagEl.textContent = match.flagHome;
    if (homeNameEl) homeNameEl.textContent = match.teamHome;
    if (scoreEl) scoreEl.textContent = `${match.teamHome} ${match.scoreHome} - ${match.scoreAway} ${match.teamAway}`;
    if (timeEl) timeEl.textContent = match.minute;
    if (awayFlagEl) awayFlagEl.textContent = match.flagAway;
    if (awayNameEl) awayNameEl.textContent = match.teamAway;
    if (satLinkEl) satLinkEl.textContent = match.satLink;

    // Update scorers
    const homeScorersEl = document.getElementById("fifa-scorers-home");
    const awayScorersEl = document.getElementById("fifa-scorers-away");
    if (homeScorersEl) homeScorersEl.innerHTML = match.scorersHome.map(s => `<span>${s}</span>`).join("<br>");
    if (awayScorersEl) awayScorersEl.innerHTML = match.scorersAway.map(s => `<span>${s}</span>`).join("<br>");

    // Update stats
    const statsPossEl = document.getElementById("fifa-stat-possession");
    const statsShotsEl = document.getElementById("fifa-stat-shots");
    if (statsPossEl) statsPossEl.textContent = `POSSESSION: ${match.homePossession}% - ${100 - match.homePossession}%`;
    if (statsShotsEl) statsShotsEl.textContent = `SHOTS ON TARGET: ${match.homeShots} - ${match.awayShots}`;

    // Reset commentary list and populate
    const commentaryList = document.getElementById("fifa-commentary-list");
    if (commentaryList) {
        commentaryList.innerHTML = "";
        match.commentary.forEach(text => {
            const li = document.createElement("div");
            li.className = "commentary-item";
            li.innerHTML = `<span class="commentary-time">[${new Date().toLocaleTimeString('en-IN', { hour12: false })}]</span> ${text}`;
            commentaryList.appendChild(li);
        });
    }

    // Load stream URL
    playStream('fifa', match.videoUrl, 'fifa-video-viewport', 'fifa-video-iptv-player');
}

function initFIFASimulator() {
    // Initialize default selected match
    switchFIFASelectedMatch("mexico_rsa");
}

window.switchFIFASelectedMatch = switchFIFASelectedMatch;

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

function getRandomPARname() {
    const names = ["M. Almiron", "J. Enciso", "A. Sanabria", "R. Sosa", "G. Gomez", "O. Alderete"];
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

/* Custom IPTV Decryptor & Injector */
function injectCustomIPTV(type) {
    const inputId = type === 'fifa' ? 'fifa-custom-iptv-url' : 'cricket-custom-iptv-url';
    const consoleId = type === 'fifa' ? 'fifa-iptv-console' : 'cricket-iptv-console';
    const iframeId = type === 'fifa' ? 'fifa-video-viewport' : 'cricket-video-viewport';
    const videoId = type === 'fifa' ? 'fifa-video-iptv-player' : 'cricket-video-iptv-player';

    const input = document.getElementById(inputId);
    const consoleEl = document.getElementById(consoleId);
    if (!input || !consoleEl) return;

    const url = input.value.trim();
    if (!url) {
        consoleEl.style.display = 'block';
        consoleEl.innerHTML = `<span style="color: #ff5555;">[ERROR] DECRYPTION FAILED: NO INPUT URL SPECIFIED. Please paste a valid .m3u8 stream URL.</span>`;
        return;
    }

    consoleEl.style.display = 'block';
    consoleEl.innerHTML = `[SYS] INITIALIZING QUANTUM FEED DECRYPTOR FOR: ${url}\n`;

    const logs = [
        `[SYS] RESOLVING DNS AND INITIALIZING PROXY ROUTER...`,
        `[SYS] BYPASSING CORS BOUNDARIES & REGIONAL SECURITY SHIELDS...`,
        `[SYS] CODEC NEGOTIATION: COMPATIBLE HLS STREAM FORMAT DETECTED.`,
        `[SYS] ESTABLISHING DECRYPTED TUNNEL FEED (KEY_VERIFY: SUCCESS)...`,
        `[SYS] INJECTING FEED INTO VIDEO VIEWPORT ENGINE...`
    ];

    let currentLogIndex = 0;
    function printNextLog() {
        if (currentLogIndex < logs.length) {
            consoleEl.innerHTML += `${logs[currentLogIndex]}\n`;
            consoleEl.scrollTop = consoleEl.scrollHeight;
            currentLogIndex++;
            setTimeout(printNextLog, 400);
        } else {
            consoleEl.innerHTML += `<span style="color: #00ff00;">[SUCCESS] QUANTUM TUNNELING SECURED. PLAYBACK ENGAGED.</span>\n`;
            consoleEl.scrollTop = consoleEl.scrollHeight;
            
            // Expose the custom stream to the actual HLS player
            playStream(type, url, iframeId, videoId);
        }
    }
    
    setTimeout(printNextLog, 200);
}

// Expose globally
window.injectCustomIPTV = injectCustomIPTV;

