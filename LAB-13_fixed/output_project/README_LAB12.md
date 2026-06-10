How to start the backend

- Open a terminal and run:

```bash
cd backend
npm install
node server.js
```

How to open the frontend

- Use Live Server to open `index.html` from the project root.

Available API endpoints (examples)

- GET all players:
  - http://localhost:3000/players
- GET players filtered by position:
  - http://localhost:3000/players?position=Forward
  - http://localhost:3000/players?position=Striker
- GET single player by id:
  - http://localhost:3000/players/1
- GET all tournaments:
  - http://localhost:3000/tournaments
- GET tournaments by status:
  - http://localhost:3000/tournaments?status=live
  - http://localhost:3000/tournaments?status=upcoming
  - http://localhost:3000/tournaments?status=qualifying
- GET teams (derived from players):
  - http://localhost:3000/teams
