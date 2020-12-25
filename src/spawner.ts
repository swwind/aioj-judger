import path from 'path';
import { spawn as childSpawn, exec as childExec } from 'child_process';
import { EventEmitter } from 'events';

export const exec = (command: string) => {
  console.log(`run $ ${command}`);
  return new Promise<string>((resolve, reject) => {
    childExec(command, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export type JudgerProcess = {
  listen(listener: (a: string) => void): void;
  read(): Promise<string>;
  send(msg: string): void;
  kill(): void;
}

export const spawn = (command: string, args: string[]): JudgerProcess => {
  const e = new EventEmitter();
  const ps = childSpawn(command, args);
  let output = '';

  const lines = [];
  const resolves = [];

  const checkoutput = () => {
    let index = output.indexOf('\n');
    while (index > -1) {
      const line = output.slice(0, index);
      if (resolves.length) {
        const resolve = resolves.shift();
        resolve(line);
      } else {
        lines.push(line);
      }
      e.emit('message', line);
      output = output.slice(index + 1);
      index = output.indexOf('\n');
    }
  }

  ps.stdout.on('data', (data) => {
    output += data.toString();
    checkoutput();
  });

  return {
    listen(listener) {
      e.on('message', listener);
    },
    read() {
      return new Promise((resolve) => {
        if (lines.length) {
          const line = lines.shift();
          resolve(line);
        } else {
          resolves.push(resolve);
        }
      });
    },
    send(msg) {
      ps.stdin.write(msg + '\n');
    },
    kill() {
      ps.kill('SIGINT');
    }
  }
}

export const spawnFromCode = async (dirname: string, mainfile: string) => {
  if (mainfile.endsWith('.cpp')) {
    const output = path.join(dirname, mainfile.slice(0, -4));
    await exec(`g++ "${path.join(dirname, mainfile)}" -o "${output}"`);
    return spawn(output, []);
  } else if (mainfile.endsWith('.py')) {
    const file = path.join(dirname, mainfile);
    const python = (await exec('which python')).split('\n')[0];
    return spawn(python, [file]);
  } else if (mainfile.endsWith('.js')) {
    const file = path.join(dirname, mainfile);
    const node = (await exec('which node')).split('\n')[0];
    return spawn(node, [file]);
  } else if (mainfile.endsWith('.ts')) {
    const file = path.join(dirname, mainfile);
    const deno = (await exec('which deno')).split('\n')[0];
    return spawn(deno, [file]);
  } else {
    throw new Error("unsupported file");
  }
}
