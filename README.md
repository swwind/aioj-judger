# AIOJ judger

For 出题人, you need to provide a bunch of files to judge an AI.

```
./
  settings.json
  ...
```

in `settings.json`, you need to provide following infomations:

```json
{
  "players": 1,
  // players that should be online in every round
  // canbe
  //   a      | a == x
  //   [a]    | a <= x
  //   [a, b] | a <= x <= b

  "main": "main.cpp" | "main.js" | "main.py",
  // main judger

  "human": false | "human.js",
  // whether human can play as AI do

  "time_limit": 5000,
  // time limit for AI

  "time_limit_human": 50000,
  // time limit for human (if human != false)
}
```

In order to better communicate status to every player, you should make a specific way to transfer game status and player operations.

e.g. In Gomoku game, you need to specific game status formats and player operations like this:

```
Game Status:

Suppose player 1 has n chess pieces, each one located in (a_i, b_i), and
player 2 has m chess pieces, each one located in (c_i, d_i), game status
will be given at the following format:

  n m a1 b1 a2 b2 ... an bn c1 d1 c2 d2 ... cm dm

```

Note that you must put all data in a single line, which means `\n` will be the EOF to every data.

And you should write `main.cpp` like this first:

```cpp
int board[500][500];
std::vector<std::pair<int, int>> p1, p2;

// initialize the game
void init() {
  memset(board, 0, sizeof board);
  p1.clear();
  p2.clear();
}

// output the currect state of the game
std::string output() {
  std::string res = std::to_string(n) + " " + std::to_string(m);
  for (auto s : p1) {
    res += " " + std::to_string(s.first) + " " + std::to_string(s.second);
  }
  for (auto s : p2) {
    res += " " + std::to_string(s.first) + " " + std::to_string(s.second);
  }
  return res;
}

int main(int argc, const char* argv[]) {
  init();
  std::cout << output() << std::endl;
  // ...
}
```

When judgement starts, `main.cpp` will be compiled, and AIs will be ready to read from `/dev/stdin` and human players will be connected to the server.

Then, main process will invoke `./main`, which should output the initialized status of the game first.

Next, main process will broadcast the game state to every players and start the game round.

At every round, the current player should made its own choice. Main process will broadcast its choice to every other player and, also the main judger.

Then, main judger should validate the player's operation and check if somebody wins after this operation.

- If somebody wins, the game will be end, and all process will be killed.
- If player's operation is invalid, the player will be kicked from the game and the operation will be recalled.
- If the game matched some conditions, judger can assert the game and return the result(draw, win or lose).
- Otherwise, the game will be continued to the next player.

For bots, inputs are given as following:

- first line: your bot id (number)
- second line: initial game state (output from judger)
- next lines:
  - first number: operation bot id, if this is your id, then it is your turn.
  - second and next numbers(if this is not your turn): player operation(output from other bots)

You can see `example` for more infomations.


