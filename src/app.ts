import { Client, GatewayIntentBits, GuildMember } from 'discord.js';
import { Commands } from './commands';
import { clear, getQueue, initPlayer, pause, play, resume, seek, skip, stop } from './music';

require('dotenv').config();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

export const PREFIX = '-';
const commands = new Commands();

client.on('ready', async () => {
    initPlayer(client);
    console.log(`${client.user?.tag} is online!`);
    console.log(`To invite the bot, click the link below:`);
    console.log(`https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot&permissions=8`);

    client.user?.setStatus('dnd');
    client.user?.setPresence({ activities: [{ name: "with YGCamel's balls" }] });
});

client.on('error', console.error);
client.on('warn', console.warn);

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guildId) return;

    if (!message.content.startsWith(PREFIX)) return;

    const command = message.content.replace(PREFIX, '').split(' ')[0].trim();

    if (commands.isMusicCommand(command)) {
        if (!(message.member instanceof GuildMember) || !message.member.voice.channel) {
            message.reply({ content: 'You are not in a voice channel!' });
            return;
        }

        if (message.guild?.members.me?.voice.channelId && message.member.voice.channelId !== message.guild?.members.me?.voice.channelId) {
            message.reply({ content: 'You are not in my voice channel!' });
            return;
        }
    }

    if (commands.isPlay(command)) {
        const query: string = message.content.replace(PREFIX + command, '');

        if (!query) {
            resume(message);
        }

        play(query, message);
    } else if (commands.isSkip(command)) {
        skip(message);
    } else if (commands.isStop(command)) {
        stop(message);
    } else if (commands.isQueue(command)) {
        getQueue(message);
    } else if (commands.isClear(command)) {
        clear(message);
    } else if (commands.isSeek(command)) {
        seek(message);
    } else if (commands.isPause(command)) {
        pause(message);
    } else if (command == 'h' || command == 'help') {
        message.reply(`**All commands**\n\n${commands.format()}`);
    } else {
        message.reply({
            content: 'Unknown command!',
        });
    }
});

client.login(process.env.TOKEN);
