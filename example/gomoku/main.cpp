#include <bits/stdc++.h>

int board[19][19];
std::vector<std::pair<int, int>> p[2];

// initialize the game
void init() {
  memset(board, -1, sizeof board);
  p[0].clear();
  p[1].clear();
}

// output the currect state of the game
std::string output() {
  std::string res = std::to_string(p[0].size()) + " " + std::to_string(p[1].size());
  for (auto s : p[0]) {
    res += " " + std::to_string(s.first) + " " + std::to_string(s.second);
  }
  for (auto s : p[1]) {
    res += " " + std::to_string(s.first) + " " + std::to_string(s.second);
  }
  return res;
}

bool validate(int x, int y) {
  if (x < 0 || x >= 19) return false;
  if (y < 0 || y >= 19) return false;
  return board[x][y] == -1;
}

// 0: player 1 win | 1: player 2 win | -1: nobody win
int checkWin() {
  for (int i = 0; i < 15; ++ i) {
    for (int j = 0; j < 15; ++ j) {
      int one, two;
      // [-]
      one = two = 0;
      for (int k = 0; k < 5; ++ k) {
        if (board[i][j+k] == 0) {
          ++ one;
        } else if (board[i][j+k] == 1) {
          ++ two;
        }
      }
      if (one == 5) return 0;
      if (two == 5) return 1;

      // [|]
      one = two = 0;
      for (int k = 0; k < 5; ++ k) {
        if (board[i+k][j] == 0) {
          ++ one;
        } else if (board[i+k][j] == 1) {
          ++ two;
        }
      }
      if (one == 5) return 0;
      if (two == 5) return 1;

      // [\]
      one = two = 0;
      for (int k = 0; k < 5; ++ k) {
        if (board[i+k][j+k] == 0) {
          ++ one;
        } else if (board[i+k][j+k] == 1) {
          ++ two;
        }
      }
      if (one == 5) return 0;
      if (two == 5) return 1;

      // [/]
      one = two = 0;
      for (int k = 0; k < 5; ++ k) {
        if (board[i+4-k][j+k] == 0) {
          ++ one;
        } else if (board[i+4-k][j+k] == 1) {
          ++ two;
        }
      }
      if (one == 5) return 0;
      if (two == 5) return 1;
    }
  }
  return -1;
}

int main(int argc, const char* argv[]) {
  init();
  std::cout << output() << std::endl << std::flush;

  int nowplayer = 0;
  std::cout << "continue " << nowplayer << std::endl << std::flush;

  while (true) {
    // read player operation
    int x, y;
    std::cin >> x >> y;

    // validate the operation
    if (!validate(x, y)) {
      std::cout << "win " << (nowplayer ^ 1) << std::endl << std::flush;
      return 0;
    }

    // take the operation
    board[x][y] = nowplayer;
    p[nowplayer].push_back(std::make_pair(x, y));

    // check if somebody wins
    int winner = checkWin();
    if (winner > -1) {
      std::cout << "win " << winner << std::endl << std::flush;
      return 0;
    }

    // check if there is no place to put chess anymore
    if (p[0].size() + p[1].size() == 19 * 19) {
      std::cout << "draw" << std::endl << std::flush;
      return 0;
    }

    // continue playing
    nowplayer ^= 1;
    std::cout << "continue " << nowplayer << std::endl << std::flush;
  }
}