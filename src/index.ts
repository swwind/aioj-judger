import path from 'path';
import { promises as fs } from 'fs';
import { spawnFromCode } from './spawner';

export type JudgerSettings = {
  players: number | number[];
  main: string;
  human: boolean | string;
  time_limit: number;
  time_limit_human: number;
}

export type BotSettings = {
  main: string;
}

const checkPlayerNumber = (limit: number | number[], x: number) => {
  if (typeof limit === 'number') {
    return x === limit;
  }
  if (limit.length === 1) {
    return limit[0] <= x;
  }
  return limit[0] <= x && x <= limit[1];
}

export const run = async (judgerpath: string, botspath: string[]) => {
  const settings = JSON.parse(await fs.readFile(path.join(judgerpath, 'settings.json'), 'utf-8')) as JudgerSettings;
  if (!checkPlayerNumber(settings.players, botspath.length)) {
    throw new Error('Faq asshole');
  }

  const bots = await Promise.all(botspath.map(async (botdir, index) => {
    const settings = JSON.parse(await fs.readFile(path.join(botdir, 'settings.json'), 'utf-8')) as BotSettings;
    const bot = await spawnFromCode(botdir, settings.main);
    bot.send(String(index));
    console.log(`bot ${index} prepared`);
    return bot;
  }));

  const judger = await spawnFromCode(judgerpath, settings.main);
  console.log('judger prepared');

  const clear = async () => {
    judger.kill();
    bots.forEach((bot) => bot.kill());

    process.exit(0);
  }

  const win = async (player: number) => {
    console.log(`bot ${player} wins!!`);
    await clear();
  }
  const draw = async () => {
    console.log('the game is draw!!');
    await clear();
  }

  console.log('game round start');
  judger.listen(async (msg) => {
    console.log(`judger > ${msg}`);

    if (msg.startsWith('continue ')) {
      const player = msg.slice(9);
      const bot = bots[Number(player)];
      bot.send(player);
      const reply = await bot.read();
      console.log(`bot ${player} > ${reply}`);
      judger.send(reply);
      bots.forEach((tb) => {
        if (tb !== bot) {
          tb.send(`${player} ${reply}`);
        }
      })
    } else if (msg.startsWith('win ')) {
      const player = msg.slice(4);
      await win(Number(player));
    } else if (msg.startsWith('draw')) {
      await draw();
    } else {
      // game status
      bots.forEach((bot) => {
        bot.send(msg);
      });
    }
  });
}

run('example/gomoku', [
  'example/gomoku-bot-1',
  'example/gomoku-bot-2',
]);
