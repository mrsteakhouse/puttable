# Puttable

A website to host miniature golf tournaments.

## Development

```shell
docker compose up -d
```

## Terminology

### Player

A player is a person who plays miniature golf. A person has a name and a rating class.
A player is created by adding it to a tournament. For subsequent tournaments a player can be selected through a dropdown.

### Tournament

A tournament is an event where scores for each player are registered.
The tournament has a score board to display achieved scores for each player sorted by given criteria.
A tournament can be configured to enforce a minimum allowed number of player per session.
The number of holes to be played is configurable.

### Scorecard

A scorecard holds the achieved score for each hole for a single user. The scorecard can be altered during active session.
### Score

A score is the amount of tries a player took to complete a hole.

### Session

One or more player can play together in a session. Each player is assigned a scorecard for the particular session.
The session stays active until it is submitted. Only submitted session will show up on the score board.

## Todo

- [ ] Define API routes
- [ ] Add development backend
- [ ] Add database migrations
- [ ] Decide on database schema
- [ ] Create tournament
- [ ] Add player to tournament
- [ ] Create player
  - [ ] Global with its own account
  - [ ] Temporary for tournaments only
- [ ] Tournament score board
- [ ] Different settings to sort the score board
  - [ ] lowest score
  - [ ] most hole-in-one
  - [ ] use the best score for a session
- [ ] Score cart view
- [ ] View to start a game with selected players
- [ ] A view for playing a session with multiple player
- [ ] Build Helm chart