# Basketball Stats Tracker

A simple web application to track basketball statistics for games with friends.

## Features

- Create new games with title and date
- Delete games (including all player statistics)
- Set up teams with custom names (Team A and Team B)
- Add players to specific teams
- Filter statistics by team
- Edit player information (name and team)
- Delete players from games
- Track detailed shooting statistics:
  - 3-point shots (makes and misses)
  - 2-point shots (makes and misses)
  - Automatic calculation of total points
- Track additional statistics for each player:
  - Rebounds
  - Assists
  - Steals
  - Blocks
  - Turnovers
  - Fouls
- Horizontal stats layout for easier data entry
- Statistics are stored locally in your browser

## How to Use

1. **Create a New Game**
   - Click the "Create New Game" button
   - Enter the game title
   - Customize team names (default: Team A and Team B)
   - The game will be added to the list with the current date

2. **Manage Games**
   - Click on a game card to view its details
   - To delete a game, click the trash icon (🗑️) in the top-right corner of the game card
   - Deleting a game will remove all player statistics for that game

3. **Add Players to Teams**
   - Click on a game from the list to view its details
   - Click the "Add Player" button
   - Enter the player's name
   - Select which team the player belongs to
   - The player will be added to the game with initial statistics set to 0

4. **Filter Players by Team**
   - Use the tabs at the top of the player section to filter:
     - "All Players" - shows players from both teams
     - "Team A" - shows only Team A players
     - "Team B" - shows only Team B players

5. **Track Shooting Statistics**
   - Each player card has sections for 3-point and 2-point shots
   - For each type of shot, you can track:
     - Made shots: Click "+" to increase or "-" to decrease
     - Missed shots: Click "+" to increase or "-" to decrease
   - Total points are automatically calculated (2pts × 2PT makes + 3pts × 3PT makes)

6. **Track Additional Statistics**
   - Each player card also allows tracking:
     - Rebounds, Assists, Steals, Blocks, Turnovers, and Fouls
     - Use the "+" and "-" buttons to update each stat
     - Statistics cannot go below 0

7. **Edit/Delete Players**
   - Each player card has edit (✏️) and delete (🗑️) buttons
   - Click the edit button to modify a player's name or team
   - Click the delete button to remove a player from the game
   - Deletion requires confirmation to prevent accidental removal

## Getting Started

Simply open `index.html` in your web browser to start using the application.

All data is saved to your browser's localStorage, so you won't lose your stats when closing the browser.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- LocalStorage API 