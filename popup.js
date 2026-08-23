function todayDate() {
  const today = new Date();

  const dateString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  return dateString
}

async function displayDivisionName(divisionId) {
  const response = await fetch("division_mapping.json");
  const mapping = await response.json();
  const divisionName = mapping[divisionId].abbreviation;

  const schedule = document.getElementsByClassName("schedule-title")[0];
  schedule.textContent = `${divisionName} Schedule`;

  const standings = document.getElementsByClassName("standings-title")[0];
  standings.textContent = `${divisionName} Standings`;
}

function getDivision() {
  const gameSelect = document.getElementById("gameSelect");
  return Number(gameSelect.value);
}

async function getGames() {
  const dateString = todayDate();

  const response = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&&date=${dateString}`,
  );
  const data = await response.json();
  //   const ids = [];
  //   for (let i = 0; i < 15; i++) {
  //     const pk = data.dates[0].games[i].gamePk;
  //     ids.push(pk);
  //   }

  //   return ids;
  const gamesched = data.dates[0].games
  console.log('sched');
  console.log(gamesched);

  return gamesched;
}

async function filterGames(gamesched, divisionId) {
  const games = [];

  const response = await fetch("team_mapping.json");
  const teams = await response.json();

  for (let i = 0; i < gamesched.length; i++) {
    let game = gamesched[i];
    let homeid = game.teams.home.team.id;
    let awayid = game.teams.away.team.id;


    if (teams[homeid].divisionId != divisionId &&
        teams[awayid].divisionId != divisionId
    ) {
        continue;
    }

    game.home_abbr = teams[homeid].abbreviation;
    game.away_abbr = teams[awayid].abbreviation;

    games.push(game);
  }

  console.log(games);
  return games;
}

async function getStandings(divisionId) {
  const dateString = todayDate();
  const response = await fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2026&date=${dateString}`);
  const data = await response.json();
  const divisionRecord = data.records.find((record) => record.division.id === divisionId);
  const records = divisionRecord.teamRecords;

  console.log(records);
  return records;
}

function createTeamGameRow(abbr, score, wins, losses, pct, isWinner, pitcher, stats, logoUrl, rowIndex) {
  const winnerClass = isWinner ? " winner" : "";

  const logo = document.createElement("img");
  logo.className = "team-logo";
  logo.style.gridRow = rowIndex;
  logo.src = logoUrl;
  logo.alt = `${abbr} logo`;
  logo.width = 30;
  logo.height = 30;

  const infoDiv = document.createElement("div");
  infoDiv.className = `team-info${winnerClass}`;
  infoDiv.style.gridRow = rowIndex;

  const nameRow = document.createElement("div");
  nameRow.className = "team-name-row";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${abbr}`; /* | ${wins}-${losses} (${pct})`; */

  nameRow.appendChild(nameSpan);
  infoDiv.appendChild(nameRow);


  if (pitcher) {
    const pitcherLines = Array.isArray(pitcher)
      ? pitcher
      : [`${pitcher}: ${stats.wins}-${stats.losses}, ${stats.era} ERA, ${stats.whip} WHIP`];

    for (const line of pitcherLines) {
      const pitcherDiv = document.createElement("div");
      pitcherDiv.className = "pitcher";
      pitcherDiv.textContent = line;
      infoDiv.appendChild(pitcherDiv);
    }
  }

  const scoreSpan = document.createElement("span");
  scoreSpan.className = `score-number${winnerClass}`;
  scoreSpan.style.gridRow = rowIndex;
  scoreSpan.textContent = score;

  return [logo, infoDiv, scoreSpan];
}

function displayStandings(records, divisionId) {
  console.log('standings');
  console.log(records);
  const standingsElement = document.getElementById("standings");
  standingsElement.replaceChildren();

  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["Team", "W", "L", "PCT", "GB", "WCGB", "Strk", "RD"];

  for (const header of headers) {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (const record of records) {
    const row = document.createElement("tr");

    const teamCell = document.createElement("td");
    const name = record.team.name;
    teamCell.textContent = name;

    const winsCell = document.createElement("td");
    const wins = record.wins;
    winsCell.textContent = wins;

    const lossesCell = document.createElement("td");
    const losses = record.losses;
    lossesCell.textContent = losses;

    const pctCell = document.createElement("td");
    const pct = record.winningPercentage;
    pctCell.textContent = pct;

    const gbCell = document.createElement("td");
    const gb = record.divisionGamesBack;
    gbCell.textContent = gb;

    const wcgbCell = document.createElement("td");
    const wcgb = record.wildCardGamesBack;
    wcgbCell.textContent = wcgb;

    const strkCell = document.createElement("td");
    const strk = record.streak.streakCode;
    strkCell.textContent = strk;

    const rdCell = document.createElement("td");
    const rd = record.runDifferential;
    rdCell.className = rd >= 0 ? "positive" : "negative";
    rdCell.textContent = rd;


    row.append(
      teamCell,
      winsCell,
      lossesCell,
      pctCell,
      gbCell,
      wcgbCell,
      strkCell,
      rdCell
    );

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  standingsElement.appendChild(table);
}



async function displayGames(games) {
  const gamesElement = document.getElementById("games");
  gamesElement.replaceChildren();

  for (const game of games) {
    const awayTeam = game.teams.away.team.name;
    const homeTeam = game.teams.home.team.name;

    const pk = game.gamePk;

    const awayTeamId = game.teams.away.team.id;
    const homeTeamId = game.teams.home.team.id;

    const awayLogoUrl = `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${awayTeamId}.svg`;
    const homeLogoUrl = `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${homeTeamId}.svg`;
    const logos = {};
    logos.away = awayLogoUrl;
    logos.home = homeLogoUrl;


    const homeAbbr = game.home_abbr;
    const awayAbbr = game.away_abbr;

    const isPreview = game.status.abstractGameState === "Preview";
    const isFinal = game.status.abstractGameState === "Final";

    const homeScore = isPreview ? "" : game.teams.home.score;
    const awayScore = isPreview ? "" : game.teams.away.score;

    const homeWins = game.teams.home.leagueRecord.wins;
    const homeLosses = game.teams.home.leagueRecord.losses;
    const homePct = game.teams.home.leagueRecord.pct;

    const awayWins = game.teams.away.leagueRecord.wins;
    const awayLosses = game.teams.away.leagueRecord.losses;
    const awayPct = game.teams.away.leagueRecord.pct;

    const liveGame = await getLiveGame(game.gamePk);

    console.log(liveGame);
    console.log('test');

    let awayPitcher = null;
    let homePitcher = null;

    if (isPreview) {
      awayPitcher = liveGame.probableAway.fullName;
      homePitcher = liveGame.probableHome.fullName;
    } else if (isFinal) {
      const awayWon = awayScore > homeScore;

      const winnerLines = liveGame.savePitcher
        ? [`WP: ${liveGame.winningPitcher}`, `SV: ${liveGame.savePitcher}`]
        : [`WP: ${liveGame.winningPitcher}`];
      const loserLines = [`LP: ${liveGame.losingPitcher}`];

      awayPitcher = awayWon ? winnerLines : loserLines;
      homePitcher = awayWon ? loserLines : winnerLines;
    } else if (liveGame.pitcher) {
      // top of the inning = away team batting = home team pitching
      if (liveGame.halfInning === "top") {
        homePitcher = liveGame.pitcher;
        awayPitcher = [`AB: ${liveGame.batter}`];
      } else {
        awayPitcher = liveGame.pitcher;
        homePitcher = [`AB: ${liveGame.batter}`];
      }
    }

    const awayId = liveGame.probableAway.id;
    const homeId = liveGame.probableHome.id;

    const awayResponse = await fetch (`https://statsapi.mlb.com/api/v1/people/${awayId}/stats?stats=season&season=2026&group=pitching`);
    const awayData = await awayResponse.json();


    const homeResponse = await fetch (`https://statsapi.mlb.com/api/v1/people/${homeId}/stats?stats=season&season=2026&group=pitching`);
    const homeData = await homeResponse.json();

    const pitcherStats = {};
    const awayStats = awayData.stats[0].splits[0].stat;
    const homeStats = homeData.stats[0].splits[0].stat;
    pitcherStats.away = awayStats;
    pitcherStats.home = homeStats;

    const time = new Date(game.gameDate).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    let status;
    if (isPreview) {
      status = time;
    } else if (isFinal) {
      status = game.status.abstractGameState;
    } else if (liveGame.inning) {
      const halfInningLabel = liveGame.halfInning === "top" ? "Top" : "Bot";
      status = `${halfInningLabel} ${liveGame.inning}`;
    } else {
      status = game.status.abstractGameState;
    }
    

    const watchButton = document.createElement("button");
    watchButton.className = "watch-button";
    watchButton.textContent = "Watch";
    watchButton.addEventListener("click", () => {
      window.open(`https://www.mlb.com/tv/g${pk}`, "_blank");
    });

    const teamsDiv = document.createElement("div");
    teamsDiv.className = "teams";
    teamsDiv.append(
      ...createTeamGameRow(awayTeam, awayScore, awayWins, awayLosses, awayPct,
        isFinal && awayScore > homeScore, awayPitcher, pitcherStats.away, logos.away, 1),
      ...createTeamGameRow(homeTeam, homeScore, homeWins, homeLosses, homePct,
        isFinal && homeScore > awayScore, homePitcher, pitcherStats.home, logos.home, 2),
    );

    const statusSpan = document.createElement("span");
    statusSpan.textContent = status;
    const statusDiv = document.createElement("div");
    statusDiv.className = "status";
    statusDiv.appendChild(statusSpan);

    const statusColumn = document.createElement("div");
    statusColumn.className = "status-column";
    statusColumn.append(statusDiv, watchButton);

    const scoreDiv = document.createElement("div");
    scoreDiv.className = "score";
    scoreDiv.append(teamsDiv, statusColumn);

    gamesElement.append(scoreDiv, document.createElement("hr"));
  }
}

async function getLiveGame(gamePk) {
  const response = await fetch(
    `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,
  );
  
  

  const data = await response.json();

  console.log(data);

  const probableAway = data.gameData.probablePitchers.away ?? null;
  const probableHome = data.gameData.probablePitchers.home ?? null;



  // Decisions are only assigned once the game is Final.
  const decisions = data.liveData.decisions ?? {};
  const winningPitcher = decisions.winner?.fullName ?? null;
  const losingPitcher = decisions.loser?.fullName ?? null;
  const savePitcher = decisions.save?.fullName ?? null;

  // Preview games have no plays yet, so allPlays is empty.
  const lastPlay = data.liveData.plays.allPlays.at(-1);
  if (!lastPlay) {
    return {
      halfInning: null,
      inning: null,
      balls: null,
      strikes: null,
      outs: null,
      pitcher: null,
      batter: null,
      probableAway,
      probableHome,
      winningPitcher,
      losingPitcher,
      savePitcher,
    };
  }

  return {
    halfInning: lastPlay.about.halfInning,
    inning: lastPlay.about.inning,
    balls: lastPlay.count.balls,
    strikes: lastPlay.count.strikes,
    outs: lastPlay.count.outs,
    pitcher: lastPlay.matchup.pitcher.fullName,
    batter: lastPlay.matchup.batter.fullName,
    probableAway,
    probableHome,
    winningPitcher,
    losingPitcher,
    savePitcher,
  };
}


async function main() {
  const divisionId = getDivision();
  displayDivisionName(divisionId);
  const gamesched = await getGames();
  const games = await filterGames(gamesched, divisionId)
  displayGames(games);

  const records = await getStandings(divisionId);
  displayStandings(records);
}

const gameSelect = document.getElementById("gameSelect");
const setDefaultButton = document.getElementById("setDefaultButton");
const defaultIndicator = document.getElementById("defaultIndicator");

let defaultDivisionId = null;

function updateDefaultIndicator() {
  const isDefault = Number(gameSelect.value) === defaultDivisionId;
  defaultIndicator.style.visibility = isDefault ? "visible" : "hidden";
}

gameSelect.addEventListener("change", () => {
  main();
  updateDefaultIndicator();
});

setDefaultButton.addEventListener("click", () => {
  defaultDivisionId = Number(gameSelect.value);
  chrome.storage.local.set({ divisionId: gameSelect.value });
  updateDefaultIndicator();
});

chrome.storage.local.get("divisionId", (result) => {
  if (result.divisionId) {
    gameSelect.value = result.divisionId;
  }
  defaultDivisionId = Number(gameSelect.value);
  updateDefaultIndicator();
  main();
});
