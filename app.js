// DOM Elements
const createGameBtn = document.getElementById('create-game-btn');
const gamesList = document.getElementById('games-list');
const noGamesMessage = document.getElementById('no-games-message');
const gameDetails = document.getElementById('game-details');
const gameTitle = document.getElementById('game-title');
const gameDate = document.getElementById('game-date');
const addPlayerBtn = document.getElementById('add-player-btn');
const backToGamesBtn = document.getElementById('back-to-games-btn');
const playersContainer = document.getElementById('players-container');
const noPlayersMessage = document.getElementById('no-players-message');
const teamStatsContainer = document.getElementById('team-stats-container');

// Team tabs
const dashboardTab = document.getElementById('dashboard-tab');
const teamATab = document.getElementById('team-a-tab');
const teamBTab = document.getElementById('team-b-tab');

// Dashboard elements
const dashboardContainer = document.getElementById('dashboard-container');
const scoreboard = document.getElementById('scoreboard');
const teamComparison = document.getElementById('team-comparison');

// Modals
const createGameModal = document.getElementById('create-game-modal');
const createGameForm = document.getElementById('create-game-form');
const gameTitleInput = document.getElementById('game-title-input');
const teamANameInput = document.getElementById('team-a-name');
const teamBNameInput = document.getElementById('team-b-name');
const cancelCreateGame = document.getElementById('cancel-create-game');
const addPlayerModal = document.getElementById('add-player-modal');
const addPlayerForm = document.getElementById('add-player-form');
const playerNameInput = document.getElementById('player-name-input');
const playerTeamSelect = document.getElementById('player-team-select');
const cancelAddPlayer = document.getElementById('cancel-add-player');
const modalOverlay = document.getElementById('modal-overlay');

// Edit player modal
const editPlayerModal = document.getElementById('edit-player-modal');
const editPlayerForm = document.getElementById('edit-player-form');
const editPlayerName = document.getElementById('edit-player-name');
const editPlayerTeam = document.getElementById('edit-player-team');
const editPlayerId = document.getElementById('edit-player-id');
const cancelEditPlayer = document.getElementById('cancel-edit-player');

// Delete player modal
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const deletePlayerId = document.getElementById('delete-player-id');
const cancelDeletePlayer = document.getElementById('cancel-delete-player');
const confirmDeletePlayer = document.getElementById('confirm-delete-player');

// Delete game modal
const confirmDeleteGameModal = document.getElementById('confirm-delete-game-modal');
const deleteGameId = document.getElementById('delete-game-id');
const cancelDeleteGame = document.getElementById('cancel-delete-game');
const confirmDeleteGame = document.getElementById('confirm-delete-game');

// Stats summary button
const toggleStatsSummaryBtn = document.getElementById('toggle-stats-summary');

// Data
let games = JSON.parse(localStorage.getItem('basketballStats')) || [];
let currentGameId = null;
let currentTeamFilter = 'all';
let showingStatsSummary = false;
let isSubmitting = false; // Flag to prevent multiple form submissions

// Functions
function saveData() {
    localStorage.setItem('basketballStats', JSON.stringify(games));
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function showGamesSection() {
    gameDetails.classList.add('hidden');
    renderGamesList();
}

function showGameDetails(gameId) {
    currentGameId = gameId;
    currentTeamFilter = 'dashboard';
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    gameTitle.textContent = game.title;
    gameDate.textContent = formatDate(game.date);
    
    // Update team tab labels
    teamATab.textContent = game.teamAName || 'Team A';
    teamBTab.textContent = game.teamBName || 'Team B';
    
    // Reset active tab
    setActiveTab('dashboard');
    
    renderPlayers(game);
    renderTeamStats(game);
    renderDashboard(game);
    
    gameDetails.classList.remove('hidden');
}

// Helper to calculate points
function calculatePoints(player) {
    const twoPointsMade = player.stats.twoPointers?.made || 0;
    const threePointsMade = player.stats.threePointers?.made || 0;
    const freeThrowsMade = player.stats.freeThrows?.made || 0;
    
    return (twoPointsMade * 2) + (threePointsMade * 3) + freeThrowsMade;
}

// Calculate shooting percentages for a player
function calculateShootingPercentages(player) {
    const twoPointsMade = player.stats.twoPointers?.made || 0;
    const twoPointsAttempted = twoPointsMade + (player.stats.twoPointers?.missed || 0);
    
    const threePointsMade = player.stats.threePointers?.made || 0;
    const threePointsAttempted = threePointsMade + (player.stats.threePointers?.missed || 0);
    
    const freeThrowsMade = player.stats.freeThrows?.made || 0;
    const freeThrowsAttempted = freeThrowsMade + (player.stats.freeThrows?.missed || 0);
    
    const totalMade = twoPointsMade + threePointsMade;
    const totalAttempted = twoPointsAttempted + threePointsAttempted;
    
    return {
        twoPointPercentage: twoPointsAttempted > 0 ? (twoPointsMade / twoPointsAttempted * 100).toFixed(1) : 0,
        threePointPercentage: threePointsAttempted > 0 ? (threePointsMade / threePointsAttempted * 100).toFixed(1) : 0,
        freeThrowPercentage: freeThrowsAttempted > 0 ? (freeThrowsMade / freeThrowsAttempted * 100).toFixed(1) : 0,
        fieldGoalPercentage: totalAttempted > 0 ? (totalMade / totalAttempted * 100).toFixed(1) : 0
    };
}

// Calculate team statistics by aggregating player stats
function calculateTeamStats(game, teamFilter) {
    let players = [];
    
    if (teamFilter === 'teamA') {
        players = game.players.filter(p => p.team === 'teamA');
    } else if (teamFilter === 'teamB') {
        players = game.players.filter(p => p.team === 'teamB');
    } else {
        return null; // Only calculate team stats for specific teams
    }
    
    if (players.length === 0) return null;
    
    const teamStats = {
        points: 0,
        twoPointers: { made: 0, missed: 0, percentage: 0 },
        threePointers: { made: 0, missed: 0, percentage: 0 },
        freeThrows: { made: 0, missed: 0, percentage: 0 },
        fieldGoals: { made: 0, missed: 0, percentage: 0 },
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0
    };
    
    players.forEach(player => {
        player = convertLegacyPlayerStats(player);
        
        // Add points
        teamStats.points += calculatePoints(player);
        
        // Add shooting stats
        teamStats.twoPointers.made += player.stats.twoPointers.made;
        teamStats.twoPointers.missed += player.stats.twoPointers.missed;
        
        teamStats.threePointers.made += player.stats.threePointers.made;
        teamStats.threePointers.missed += player.stats.threePointers.missed;
        
        teamStats.freeThrows.made += player.stats.freeThrows?.made || 0;
        teamStats.freeThrows.missed += player.stats.freeThrows?.missed || 0;
        
        // Add other stats
        teamStats.rebounds += player.stats.rebounds;
        teamStats.assists += player.stats.assists;
        teamStats.steals += player.stats.steals;
        teamStats.blocks += player.stats.blocks;
        teamStats.turnovers += player.stats.turnovers;
        teamStats.fouls += player.stats.fouls;
    });
    
    // Calculate total field goals (2PT + 3PT)
    teamStats.fieldGoals.made = teamStats.twoPointers.made + teamStats.threePointers.made;
    teamStats.fieldGoals.missed = teamStats.twoPointers.missed + teamStats.threePointers.missed;
    
    // Calculate percentages
    const twoPointAttempts = teamStats.twoPointers.made + teamStats.twoPointers.missed;
    teamStats.twoPointers.percentage = twoPointAttempts > 0 
        ? (teamStats.twoPointers.made / twoPointAttempts * 100).toFixed(1) 
        : 0;
        
    const threePointAttempts = teamStats.threePointers.made + teamStats.threePointers.missed;
    teamStats.threePointers.percentage = threePointAttempts > 0 
        ? (teamStats.threePointers.made / threePointAttempts * 100).toFixed(1) 
        : 0;
        
    const freeThrowAttempts = teamStats.freeThrows.made + teamStats.freeThrows.missed;
    teamStats.freeThrows.percentage = freeThrowAttempts > 0 
        ? (teamStats.freeThrows.made / freeThrowAttempts * 100).toFixed(1) 
        : 0;
        
    const fieldGoalAttempts = teamStats.fieldGoals.made + teamStats.fieldGoals.missed;
    teamStats.fieldGoals.percentage = fieldGoalAttempts > 0 
        ? (teamStats.fieldGoals.made / fieldGoalAttempts * 100).toFixed(1) 
        : 0;
    
    return teamStats;
}

// Convert legacy player stats format to the new format with makes/misses
function convertLegacyPlayerStats(player) {
    if (!player.stats.twoPointers && !player.stats.threePointers) {
        // This is a legacy player with only points
        const originalPoints = player.stats.points || 0;
        
        // Set default values
        player.stats.twoPointers = {
            made: Math.floor(originalPoints / 2), // Assume half of points were 2-pointers
            missed: 0
        };
        
        player.stats.threePointers = {
            made: 0,
            missed: 0
        };
        
        player.stats.freeThrows = {
            made: 0,
            missed: 0
        };
        
        // Remove old points property
        delete player.stats.points;
    }
    
    // Add freeThrows if it doesn't exist (for players created before this update)
    if (!player.stats.freeThrows) {
        player.stats.freeThrows = {
            made: 0,
            missed: 0
        };
    }
    
    return player;
}

function setActiveTab(teamFilter) {
    currentTeamFilter = teamFilter;
    
    // Remove active class from all tabs
    dashboardTab.classList.remove('active');
    teamATab.classList.remove('active');
    teamBTab.classList.remove('active');
    
    // Add active class to selected tab
    if (teamFilter === 'dashboard') {
        dashboardTab.classList.add('active');
        dashboardContainer.style.display = 'block';
        playersContainer.style.display = 'none';
    } else if (teamFilter === 'teamA') {
        teamATab.classList.add('active');
        dashboardContainer.style.display = 'none';
        playersContainer.style.display = 'grid';
    } else if (teamFilter === 'teamB') {
        teamBTab.classList.add('active');
        dashboardContainer.style.display = 'none';
        playersContainer.style.display = 'grid';
    }
    
    // Re-render players with filter
    const game = games.find(g => g.id === currentGameId);
    if (game) {
        renderPlayers(game);
        renderTeamStats(game);
        
        if (teamFilter === 'dashboard') {
            renderDashboard(game);
        }
    }
}

function renderGamesList() {
    // Clear list except for no games message
    while (gamesList.children.length > 1) {
        gamesList.removeChild(gamesList.firstChild);
    }
    
    if (games.length === 0) {
        noGamesMessage.classList.remove('hidden');
        return;
    }
    
    noGamesMessage.classList.add('hidden');
    
    // Sort games by date (newest first)
    const sortedGames = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="game-card-actions">
                <button class="game-delete-btn" data-id="${game.id}" title="Delete game">🗑️</button>
            </div>
            <div class="game-card-content">
                <h3>${game.title}</h3>
                <p>${formatDate(game.date)}</p>
                <p>${game.teamAName || 'Team A'} vs ${game.teamBName || 'Team B'}</p>
            </div>
        `;
        
        // Add click event for game card to view details
        gameCard.addEventListener('click', (e) => {
            // Only navigate to game details if not clicking the delete button
            if (!e.target.closest('.game-delete-btn')) {
                showGameDetails(game.id);
            }
        });
        
        // Add click event for delete button
        const deleteBtn = gameCard.querySelector('.game-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent game card click
            openDeleteGameModal(game.id);
        });
        
        gamesList.insertBefore(gameCard, gamesList.firstChild);
    });
}

// Render team statistics
function renderTeamStats(game) {
    if (!teamStatsContainer) return;
    
    // Only show team stats when on a team tab (not 'all')
    if (currentTeamFilter === 'all') {
        teamStatsContainer.classList.add('hidden');
        return;
    }
    
    const teamStats = calculateTeamStats(game, currentTeamFilter);
    if (!teamStats) {
        teamStatsContainer.classList.add('hidden');
        return;
    }
    
    const teamName = currentTeamFilter === 'teamA' ? 
        (game.teamAName || 'Team A') : 
        (game.teamBName || 'Team B');
        
    const teamColorClass = currentTeamFilter === 'teamA' ? 'team-a-color' : 'team-b-color';
    
    teamStatsContainer.innerHTML = `
        <h3 class="team-stats-title ${teamColorClass}">${teamName} Team Statistics</h3>
        <div class="stats-summary">
            <div class="stat-summary-item">
                <span class="stat-summary-label">Points</span>
                <span class="stat-summary-value">${teamStats.points}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Field Goal %</span>
                <span class="stat-summary-value">${teamStats.fieldGoals.percentage}%</span>
                <span class="stat-summary-detail">(${teamStats.fieldGoals.made}/${teamStats.fieldGoals.made + teamStats.fieldGoals.missed})</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">2-Point %</span>
                <span class="stat-summary-value">${teamStats.twoPointers.percentage}%</span>
                <span class="stat-summary-detail">(${teamStats.twoPointers.made}/${teamStats.twoPointers.made + teamStats.twoPointers.missed})</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">3-Point %</span>
                <span class="stat-summary-value">${teamStats.threePointers.percentage}%</span>
                <span class="stat-summary-detail">(${teamStats.threePointers.made}/${teamStats.threePointers.made + teamStats.threePointers.missed})</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Free Throw %</span>
                <span class="stat-summary-value">${teamStats.freeThrows.percentage}%</span>
                <span class="stat-summary-detail">(${teamStats.freeThrows.made}/${teamStats.freeThrows.made + teamStats.freeThrows.missed})</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Rebounds</span>
                <span class="stat-summary-value">${teamStats.rebounds}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Assists</span>
                <span class="stat-summary-value">${teamStats.assists}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Steals</span>
                <span class="stat-summary-value">${teamStats.steals}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Blocks</span>
                <span class="stat-summary-value">${teamStats.blocks}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Turnovers</span>
                <span class="stat-summary-value">${teamStats.turnovers}</span>
            </div>
            
            <div class="stat-summary-item">
                <span class="stat-summary-label">Fouls</span>
                <span class="stat-summary-value">${teamStats.fouls}</span>
            </div>
        </div>
    `;
    
    teamStatsContainer.classList.remove('hidden');
}

function renderPlayers(game) {
    // Clear list except for no players message
    while (playersContainer.children.length > 1) {
        playersContainer.removeChild(playersContainer.firstChild);
    }
    
    if (!game.players || game.players.length === 0) {
        noPlayersMessage.classList.remove('hidden');
        return;
    }
    
    // Filter players based on selected team
    let filteredPlayers = game.players;
    if (currentTeamFilter !== 'all') {
        filteredPlayers = game.players.filter(player => player.team === currentTeamFilter);
    }
    
    if (filteredPlayers.length === 0) {
        noPlayersMessage.classList.remove('hidden');
        return;
    }
    
    noPlayersMessage.classList.add('hidden');
    
    filteredPlayers.forEach(player => {
        // Ensure player stats are in the new format
        player = convertLegacyPlayerStats(player);
        
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${player.team === 'teamA' ? 'team-a' : 'team-b'}`;
        
        const teamName = player.team === 'teamA' ? (game.teamAName || 'Team A') : (game.teamBName || 'Team B');
        const teamColorClass = player.team === 'teamA' ? 'team-a-color' : 'team-b-color';
        
        // Calculate total points
        const totalPoints = calculatePoints(player);
        
        // Calculate shooting percentages
        const shootingPercentages = calculateShootingPercentages(player);
        
        // Build the player card content
        let playerCardContent = `
            <div class="player-header">
                <h3>${player.name}</h3>
                <div class="player-actions">
                    <button class="action-btn edit-btn" data-id="${player.id}" title="Edit player">✏️</button>
                    <button class="action-btn delete-btn" data-id="${player.id}" title="Delete player">🗑️</button>
                </div>
            </div>
            <div class="player-name-border"></div>
            <div class="player-team">
                <span class="${teamColorClass}">${teamName}</span>
                <span class="total-points">Points: ${totalPoints}</span>
            </div>
        `;
        
        // Add shooting percentages section
        playerCardContent += `
            <div class="shooting-percentages">
                <div class="percentage-item">
                    <span class="percentage-label">FG%:</span>
                    <span class="percentage-value">${shootingPercentages.fieldGoalPercentage}%</span>
                </div>
                <div class="percentage-item">
                    <span class="percentage-label">2P%:</span>
                    <span class="percentage-value">${shootingPercentages.twoPointPercentage}%</span>
                </div>
                <div class="percentage-item">
                    <span class="percentage-label">3P%:</span>
                    <span class="percentage-value">${shootingPercentages.threePointPercentage}%</span>
                </div>
                <div class="percentage-item">
                    <span class="percentage-label">FT%:</span>
                    <span class="percentage-value">${shootingPercentages.freeThrowPercentage}%</span>
                </div>
            </div>
        `;
        
        // Add stats container for 3PT, 2PT, and FT
        playerCardContent += `
            <div class="stats-container">
                <div class="stat-group">
                    <div class="stat-header">3PT</div>
                    <div class="stat-row">
                        <div class="stat-item horizontal">
                            <span class="stat-label">Made</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="threePointers.made" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="threePointers.made">${player.stats.threePointers.made}</span>
                                <button class="stat-btn success" data-stat="threePointers.made" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="stat-item horizontal">
                            <span class="stat-label">Missed</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="threePointers.missed" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="threePointers.missed">${player.stats.threePointers.missed}</span>
                                <button class="stat-btn success" data-stat="threePointers.missed" data-action="increase">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-group">
                    <div class="stat-header">2PT</div>
                    <div class="stat-row">
                        <div class="stat-item horizontal">
                            <span class="stat-label">Made</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="twoPointers.made" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="twoPointers.made">${player.stats.twoPointers.made}</span>
                                <button class="stat-btn success" data-stat="twoPointers.made" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="stat-item horizontal">
                            <span class="stat-label">Missed</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="twoPointers.missed" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="twoPointers.missed">${player.stats.twoPointers.missed}</span>
                                <button class="stat-btn success" data-stat="twoPointers.missed" data-action="increase">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-group">
                    <div class="stat-header">FT</div>
                    <div class="stat-row">
                        <div class="stat-item horizontal">
                            <span class="stat-label">Made</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="freeThrows.made" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="freeThrows.made">${player.stats.freeThrows.made}</span>
                                <button class="stat-btn success" data-stat="freeThrows.made" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="stat-item horizontal">
                            <span class="stat-label">Missed</span>
                            <div class="stat-control">
                                <button class="stat-btn danger" data-stat="freeThrows.missed" data-action="decrease">-</button>
                                <span class="stat-value" data-stat="freeThrows.missed">${player.stats.freeThrows.missed}</span>
                                <button class="stat-btn success" data-stat="freeThrows.missed" data-action="increase">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-row">
                    <div class="stat-item horizontal">
                        <span class="stat-label">Rebounds</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="rebounds" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="rebounds">${player.stats.rebounds}</span>
                            <button class="stat-btn success" data-stat="rebounds" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="stat-item horizontal">
                        <span class="stat-label">Assists</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="assists" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="assists">${player.stats.assists}</span>
                            <button class="stat-btn success" data-stat="assists" data-action="increase">+</button>
                        </div>
                    </div>
                </div>
                
                <div class="stat-row">
                    <div class="stat-item horizontal">
                        <span class="stat-label">Steals</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="steals" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="steals">${player.stats.steals}</span>
                            <button class="stat-btn success" data-stat="steals" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="stat-item horizontal">
                        <span class="stat-label">Blocks</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="blocks" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="blocks">${player.stats.blocks}</span>
                            <button class="stat-btn success" data-stat="blocks" data-action="increase">+</button>
                        </div>
                    </div>
                </div>
                
                <div class="stat-row">
                    <div class="stat-item horizontal">
                        <span class="stat-label">Turnovers</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="turnovers" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="turnovers">${player.stats.turnovers}</span>
                            <button class="stat-btn success" data-stat="turnovers" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="stat-item horizontal">
                        <span class="stat-label">Fouls</span>
                        <div class="stat-control">
                            <button class="stat-btn danger" data-stat="fouls" data-action="decrease">-</button>
                            <span class="stat-value" data-stat="fouls">${player.stats.fouls}</span>
                            <button class="stat-btn success" data-stat="fouls" data-action="increase">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        playerCard.innerHTML = playerCardContent;
        
        // Add event listeners for stat buttons
        const statBtns = playerCard.querySelectorAll('.stat-btn');
        statBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent any default button behavior
                e.stopPropagation(); // Stop event bubbling
                const stat = btn.dataset.stat;
                const action = btn.dataset.action;
                updatePlayerStat(player.id, stat, action);
            });
        });
        
        // Add event listeners for edit and delete buttons
        const editBtn = playerCard.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditPlayerModal(player.id);
        });
        
        const deleteBtn = playerCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeletePlayerModal(player.id);
        });
        
        playersContainer.insertBefore(playerCard, playersContainer.firstChild);
    });
}

function updatePlayerStat(playerId, stat, action) {
    // Remember the current scroll position
    const scrollPosition = window.scrollY;
    
    const gameIndex = games.findIndex(g => g.id === currentGameId);
    if (gameIndex === -1) return;
    
    const playerIndex = games[gameIndex].players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    const player = games[gameIndex].players[playerIndex];
    
    // Handle nested stats (like twoPointers.made)
    if (stat.includes('.')) {
        const [statCategory, statName] = stat.split('.');
        
        if (action === 'increase') {
            player.stats[statCategory][statName]++;
        } else if (action === 'decrease' && player.stats[statCategory][statName] > 0) {
            player.stats[statCategory][statName]--;
        }
    } else {
        if (action === 'increase') {
            player.stats[stat]++;
        } else if (action === 'decrease' && player.stats[stat] > 0) {
            player.stats[stat]--;
        }
    }
    
    saveData();
    const game = games[gameIndex];
    renderPlayers(game);
    renderTeamStats(game);
    
    // Update dashboard if it's active
    if (currentTeamFilter === 'dashboard') {
        renderDashboard(game);
    }
    
    // Restore the scroll position after rendering
    window.scrollTo({
        top: scrollPosition,
        behavior: 'instant' // Use instant to avoid smooth scrolling effect
    });
}

function openEditPlayerModal(playerId) {
    const gameIndex = games.findIndex(g => g.id === currentGameId);
    if (gameIndex === -1) return;
    
    const player = games[gameIndex].players.find(p => p.id === playerId);
    if (!player) return;
    
    // Update edit form fields
    editPlayerName.value = player.name;
    editPlayerTeam.value = player.team;
    editPlayerId.value = player.id;
    
    // Update team options in select
    const teamAOption = editPlayerTeam.querySelector('option[value="teamA"]');
    const teamBOption = editPlayerTeam.querySelector('option[value="teamB"]');
    
    teamAOption.textContent = games[gameIndex].teamAName || 'Team A';
    teamBOption.textContent = games[gameIndex].teamBName || 'Team B';
    
    showModal(editPlayerModal);
}

function openDeletePlayerModal(playerId) {
    deletePlayerId.value = playerId;
    showModal(confirmDeleteModal);
}

function openDeleteGameModal(gameId) {
    deleteGameId.value = gameId;
    showModal(confirmDeleteGameModal);
}

function editPlayer(playerId, name, team) {
    // Remember the current scroll position
    const scrollPosition = window.scrollY;
    
    const gameIndex = games.findIndex(g => g.id === currentGameId);
    if (gameIndex === -1) return;
    
    const playerIndex = games[gameIndex].players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    games[gameIndex].players[playerIndex].name = name;
    games[gameIndex].players[playerIndex].team = team;
    
    saveData();
    const game = games[gameIndex];
    renderPlayers(game);
    renderTeamStats(game);
    
    // Update dashboard if it's active
    if (currentTeamFilter === 'dashboard') {
        renderDashboard(game);
    }
    
    // Restore the scroll position after rendering
    window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
    });
}

function deletePlayer(playerId) {
    // Remember the current scroll position
    const scrollPosition = window.scrollY;
    
    const gameIndex = games.findIndex(g => g.id === currentGameId);
    if (gameIndex === -1) return;
    
    games[gameIndex].players = games[gameIndex].players.filter(p => p.id !== playerId);
    
    saveData();
    const game = games[gameIndex];
    renderPlayers(game);
    renderTeamStats(game);
    
    // Update dashboard if it's active
    if (currentTeamFilter === 'dashboard') {
        renderDashboard(game);
    }
    
    // Restore the scroll position after rendering
    window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
    });
}

function deleteGame(gameId) {
    if (!gameId) return;
    
    games = games.filter(g => g.id !== gameId);
    
    // If we're currently viewing the deleted game, go back to games list
    if (currentGameId === gameId) {
        showGamesSection();
    }
    
    saveData();
    renderGamesList();
}

function createGame(title, teamAName, teamBName) {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    isSubmitting = true;
    
    const newGame = {
        id: Date.now().toString(),
        title: title,
        date: new Date().toISOString(),
        teamAName: teamAName,
        teamBName: teamBName,
        players: []
    };
    
    games.push(newGame);
    saveData();
    renderGamesList();
    
    // Reset submission flag after a short delay
    setTimeout(() => {
        isSubmitting = false;
    }, 1000);
}

function addPlayer(name, team) {
    // Remember the current scroll position
    const scrollPosition = window.scrollY;
    
    const gameIndex = games.findIndex(g => g.id === currentGameId);
    if (gameIndex === -1) return;
    
    const newPlayer = {
        id: Date.now().toString(),
        name: name,
        team: team,
        stats: {
            twoPointers: {
                made: 0,
                missed: 0
            },
            threePointers: {
                made: 0,
                missed: 0
            },
            freeThrows: {
                made: 0,
                missed: 0
            },
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            fouls: 0
        }
    };
    
    games[gameIndex].players.push(newPlayer);
    saveData();
    const game = games[gameIndex];
    renderPlayers(game);
    renderTeamStats(game);
    
    // Update dashboard if it's active
    if (currentTeamFilter === 'dashboard') {
        renderDashboard(game);
    }
    
    // For new players, we might want to scroll to see them,
    // but only if we're not on the dashboard
    if (currentTeamFilter !== 'dashboard') {
        // Optional: Scroll to the bottom to see the new player
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        // Restore the scroll position after rendering
        window.scrollTo({
            top: scrollPosition,
            behavior: 'instant'
        });
    }
}

// Modal functions
function showModal(modal) {
    modal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
}

// Update select options based on current game
function updateTeamOptions() {
    const game = games.find(g => g.id === currentGameId);
    if (!game) return;
    
    const teamAOption = playerTeamSelect.querySelector('option[value="teamA"]');
    const teamBOption = playerTeamSelect.querySelector('option[value="teamB"]');
    
    teamAOption.textContent = game.teamAName || 'Team A';
    teamBOption.textContent = game.teamBName || 'Team B';
}

// Toggle stats summary view
function toggleStatsSummary() {
    showingStatsSummary = !showingStatsSummary;
    
    // Update button text
    if (toggleStatsSummaryBtn) {
        toggleStatsSummaryBtn.textContent = showingStatsSummary ? 'Hide Team Stats' : 'Show Team Stats';
    }
    
    // Show/hide team stats
    const game = games.find(g => g.id === currentGameId);
    if (game) {
        renderTeamStats(game);
    }
}

// Calculate team scores
function calculateTeamScore(game, team) {
    const players = game.players.filter(p => p.team === team);
    let totalPoints = 0;
    
    players.forEach(player => {
        player = convertLegacyPlayerStats(player);
        totalPoints += calculatePoints(player);
    });
    
    return totalPoints;
}

// Render the dashboard with scoreboard and team comparison
function renderDashboard(game) {
    if (!dashboardContainer || !scoreboard || !teamComparison) return;
    
    // Calculate scores for both teams
    const teamAScore = calculateTeamScore(game, 'teamA');
    const teamBScore = calculateTeamScore(game, 'teamB');
    
    // Render scoreboard
    scoreboard.innerHTML = `
        <div class="team-score">
            <div class="team-name team-a-color">${game.teamAName || 'Team A'}</div>
            <div class="score">${teamAScore}</div>
        </div>
        <div class="vs">VS</div>
        <div class="team-score">
            <div class="team-name team-b-color">${game.teamBName || 'Team B'}</div>
            <div class="score">${teamBScore}</div>
        </div>
    `;
    
    // Get team stats for comparison
    const teamAStats = calculateTeamStats(game, 'teamA') || {
        points: 0,
        fieldGoals: { percentage: 0 },
        twoPointers: { percentage: 0 },
        threePointers: { percentage: 0 },
        freeThrows: { percentage: 0 },
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0
    };
    
    const teamBStats = calculateTeamStats(game, 'teamB') || {
        points: 0,
        fieldGoals: { percentage: 0 },
        twoPointers: { percentage: 0 },
        threePointers: { percentage: 0 },
        freeThrows: { percentage: 0 },
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0
    };
    
    // Render team comparison table
    teamComparison.innerHTML = `
        <h3>Team Comparison</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Statistic</th>
                    <th class="team-a-col">${game.teamAName || 'Team A'}</th>
                    <th class="team-b-col">${game.teamBName || 'Team B'}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="stat-name">Points</td>
                    <td class="team-a-col">${teamAStats.points}</td>
                    <td class="team-b-col">${teamBStats.points}</td>
                </tr>
                <tr>
                    <td class="stat-name">Field Goal %</td>
                    <td class="team-a-col">${teamAStats.fieldGoals.percentage}%</td>
                    <td class="team-b-col">${teamBStats.fieldGoals.percentage}%</td>
                </tr>
                <tr>
                    <td class="stat-name">2-Point %</td>
                    <td class="team-a-col">${teamAStats.twoPointers.percentage}%</td>
                    <td class="team-b-col">${teamBStats.twoPointers.percentage}%</td>
                </tr>
                <tr>
                    <td class="stat-name">3-Point %</td>
                    <td class="team-a-col">${teamAStats.threePointers.percentage}%</td>
                    <td class="team-b-col">${teamBStats.threePointers.percentage}%</td>
                </tr>
                <tr>
                    <td class="stat-name">Free Throw %</td>
                    <td class="team-a-col">${teamAStats.freeThrows.percentage}%</td>
                    <td class="team-b-col">${teamBStats.freeThrows.percentage}%</td>
                </tr>
                <tr>
                    <td class="stat-name">Rebounds</td>
                    <td class="team-a-col">${teamAStats.rebounds}</td>
                    <td class="team-b-col">${teamBStats.rebounds}</td>
                </tr>
                <tr>
                    <td class="stat-name">Assists</td>
                    <td class="team-a-col">${teamAStats.assists}</td>
                    <td class="team-b-col">${teamBStats.assists}</td>
                </tr>
                <tr>
                    <td class="stat-name">Steals</td>
                    <td class="team-a-col">${teamAStats.steals}</td>
                    <td class="team-b-col">${teamBStats.steals}</td>
                </tr>
                <tr>
                    <td class="stat-name">Blocks</td>
                    <td class="team-a-col">${teamAStats.blocks}</td>
                    <td class="team-b-col">${teamBStats.blocks}</td>
                </tr>
                <tr>
                    <td class="stat-name">Turnovers</td>
                    <td class="team-a-col">${teamAStats.turnovers}</td>
                    <td class="team-b-col">${teamBStats.turnovers}</td>
                </tr>
            </tbody>
        </table>
    `;
    
    // Render individual player statistics
    renderPlayerStats(game);
}

// Render individual player statistics for the dashboard
function renderPlayerStats(game) {
    if (!dashboardContainer) return;
    
    // Create a container for player stats if it doesn't exist
    let playerStatsSection = dashboardContainer.querySelector('.player-stats-section');
    if (!playerStatsSection) {
        playerStatsSection = document.createElement('div');
        playerStatsSection.className = 'player-stats-section';
        dashboardContainer.appendChild(playerStatsSection);
    }
    
    // Check if there are players
    if (!game.players || game.players.length === 0) {
        playerStatsSection.innerHTML = '<h3>Individual Player Statistics</h3><p>No players added yet.</p>';
        return;
    }
    
    // Create HTML for player stats
    let playersHtml = `<h3>Individual Player Statistics</h3>`;
    
    // Create separate tables for each team
    let teamAPlayers = game.players.filter(p => p.team === 'teamA');
    let teamBPlayers = game.players.filter(p => p.team === 'teamB');
    
    // Sort players by points (highest to lowest)
    teamAPlayers = teamAPlayers.map(player => {
        player = convertLegacyPlayerStats(player);
        return {
            ...player,
            points: calculatePoints(player)
        };
    }).sort((a, b) => b.points - a.points);
    
    teamBPlayers = teamBPlayers.map(player => {
        player = convertLegacyPlayerStats(player);
        return {
            ...player,
            points: calculatePoints(player)
        };
    }).sort((a, b) => b.points - a.points);
    
    // Add Team A players table
    if (teamAPlayers.length > 0) {
        playersHtml += `
            <h4 class="team-a-color">${game.teamAName || 'Team A'}</h4>
            <div class="player-stats-table-container">
                <table class="player-stats-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>PTS</th>
                            <th>FG%</th>
                            <th>2P%</th>
                            <th>3P%</th>
                            <th>FT%</th>
                            <th>REB</th>
                            <th>AST</th>
                            <th>STL</th>
                            <th>BLK</th>
                            <th>TO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderPlayerRows(teamAPlayers, game)}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Add Team B players table
    if (teamBPlayers.length > 0) {
        playersHtml += `
            <h4 class="team-b-color">${game.teamBName || 'Team B'}</h4>
            <div class="player-stats-table-container">
                <table class="player-stats-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>PTS</th>
                            <th>FG%</th>
                            <th>2P%</th>
                            <th>3P%</th>
                            <th>FT%</th>
                            <th>REB</th>
                            <th>AST</th>
                            <th>STL</th>
                            <th>BLK</th>
                            <th>TO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderPlayerRows(teamBPlayers, game)}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    playerStatsSection.innerHTML = playersHtml;
}

// Helper function to render player rows
function renderPlayerRows(players, game) {
    return players.map(player => {
        // Ensure player stats are in the new format
        player = convertLegacyPlayerStats(player);
        
        // Get points (already calculated when sorting) or calculate if not available
        const points = player.points !== undefined ? player.points : calculatePoints(player);
        const percentages = calculateShootingPercentages(player);
        
        return `
            <tr>
                <td class="player-name">${player.name}</td>
                <td>${points}</td>
                <td>${percentages.fieldGoalPercentage}%</td>
                <td>${percentages.twoPointPercentage}%</td>
                <td>${percentages.threePointPercentage}%</td>
                <td>${percentages.freeThrowPercentage}%</td>
                <td>${player.stats.rebounds}</td>
                <td>${player.stats.assists}</td>
                <td>${player.stats.steals}</td>
                <td>${player.stats.blocks}</td>
                <td>${player.stats.turnovers}</td>
            </tr>
        `;
    }).join('');
}

// Event Listeners
createGameBtn.addEventListener('click', () => {
    gameTitleInput.value = '';
    teamANameInput.value = 'Team A';
    teamBNameInput.value = 'Team B';
    showModal(createGameModal);
});

cancelCreateGame.addEventListener('click', () => {
    hideModal(createGameModal);
});

createGameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    const title = gameTitleInput.value.trim();
    const teamAName = teamANameInput.value.trim();
    const teamBName = teamBNameInput.value.trim();
    
    if (title) {
        createGame(title, teamAName, teamBName);
        hideModal(createGameModal);
    }
});

addPlayerBtn.addEventListener('click', () => {
    playerNameInput.value = '';
    playerTeamSelect.value = 'teamA';
    updateTeamOptions();
    showModal(addPlayerModal);
});

cancelAddPlayer.addEventListener('click', () => {
    hideModal(addPlayerModal);
});

addPlayerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    const team = playerTeamSelect.value;
    
    if (name) {
        addPlayer(name, team);
        hideModal(addPlayerModal);
    }
});

// Edit player event listeners
cancelEditPlayer.addEventListener('click', () => {
    hideModal(editPlayerModal);
});

editPlayerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = editPlayerName.value.trim();
    const team = editPlayerTeam.value;
    const playerId = editPlayerId.value;
    
    if (name && playerId) {
        editPlayer(playerId, name, team);
        hideModal(editPlayerModal);
    }
});

// Delete player event listeners
cancelDeletePlayer.addEventListener('click', () => {
    hideModal(confirmDeleteModal);
});

confirmDeletePlayer.addEventListener('click', () => {
    const playerId = deletePlayerId.value;
    if (playerId) {
        deletePlayer(playerId);
        hideModal(confirmDeleteModal);
    }
});

// Delete game event listeners
cancelDeleteGame.addEventListener('click', () => {
    hideModal(confirmDeleteGameModal);
});

confirmDeleteGame.addEventListener('click', () => {
    const gameId = deleteGameId.value;
    if (gameId) {
        deleteGame(gameId);
        hideModal(confirmDeleteGameModal);
    }
});

backToGamesBtn.addEventListener('click', showGamesSection);

// Team tab filters
dashboardTab.addEventListener('click', () => setActiveTab('dashboard'));
teamATab.addEventListener('click', () => setActiveTab('teamA'));
teamBTab.addEventListener('click', () => setActiveTab('teamB'));

// Toggle stats summary button
if (toggleStatsSummaryBtn) {
    toggleStatsSummaryBtn.addEventListener('click', toggleStatsSummary);
}

// Initialize app
renderGamesList(); 