export class Commands {
    musicCommands: any;

    constructor() {
        const mCommands = [
            ['play', ['p'], 'Play a song by search or url'],
            ['skip', ['fs'], 'Skip current song '],
            ['stop', [], 'Stop music player'],
            ['queue', ['list'], 'View all songs in queue'],
            ['clear', [], 'Clear music queue'],
            ['seek', [], 'Seek current song to `time`'],
            ['pause', [], 'Pause the player`'],
        ];

        this.musicCommands = {};

        mCommands.forEach((mCommand: any, i) => {
            this.musicCommands[i] = new Command(mCommand[0], mCommand[1], mCommand[2]);
        });
    }

    format() {
        const toReturn = Object.values(this.musicCommands).map((index: any) => {
            return `**${index.command}${index.alts.length !== 0 ? ` , ${index.alts}` : ''}** - ${index.description}`;
        });

        return toReturn.join('\n');
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

    isPause(command: string) {
        return this.musicCommands[6].is(command);
    }
}

class Command {
    constructor(command: string, alts: string[], description: string) {
        this.command = command;
        this.alts = alts;
        this.description = description;
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
    description: string;
}
