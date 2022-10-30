export class Commands {
    musicCommands: any;

    constructor() {
        const mCommands = [
            ['play', ['p']],
            ['skip', ['fs']],
            ['stop', ['']],
            ['queue', ['list']],
            ['clear', ['']],
            ['seek', ['']],
        ];

        this.musicCommands = {};

        mCommands.forEach((mCommand: any, i) => {
            this.musicCommands[i] = new Command(mCommand[0], mCommand[1]);
        });
    }

    isMusicCommand(command: string) {
        const toArray: Command[] = Object.values(this.musicCommands);

        toArray.forEach((index: Command) => {
            if (index.is(command)) {
                return true;
            }
        });

        return false;
    }

    isPlay(command: string) {
        return this.musicCommands[0].is(command);
    }

    isSkip(command: string) {
        return this.musicCommands[1].is(command);
    }

    isStop(command: string) {
        return this.musicCommands[2].is(command);
    }

    isQueue(command: string) {
        return this.musicCommands[3].is(command);
    }

    isClear(command: string) {
        return this.musicCommands[4].is(command);
    }

    isSeek(command: string) {
        return this.musicCommands[5].is(command);
    }
}

class Command {
    constructor(command: string, alts: string[]) {
        this.command = command;
        this.alts = alts;
    }

    is(command: string) {
        if (command == this.command) return true;

        if (this.alts.find((str) => str === command)) {
            return true;
        }

        return false;
    }
}

interface Command {
    command: string;
    alts: string[];
}
