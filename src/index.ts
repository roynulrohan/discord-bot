import { Client, GuildMember, GatewayIntentBits, ActivityType } from 'discord.js';
import { Player, QueryType, Queue, Track } from 'discord-player';
import axios from 'axios';
import { Commands } from './commands';

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const prefix = '-';
const bakrApiUrl = 'https://bakraas.com/';
const commands = new Commands();

const denyMessages = ['Fuck off', 'Fuck you', 'No', "Nah don't think so", 'Lol fuck off'];

client.on('ready', async () => {
    console.log(`${client.user?.tag} is online!`);

    // const guilds = await client.guilds.fetch();
    // guilds.forEach(async (guild) => {
    //     const fetchedGuild = await guild.fetch();
    //     fetchedGuild.commands
    //         .set([
    //             {
    //                 name: 'play',
    //                 description: 'Plays a song from youtube',
    //                 options: [
    //                     {
    //                         name: 'query',
    //                         type: 3,
    //                         description: 'The song you want to play',
    //                         required: true,
    //                     },
    //                 ],
    //             },
    //             {
    //                 name: 'skip',
    //                 description: 'Skip to the current song',
    //             },
    //             {
    //                 name: 'stop',
    //                 description: 'Stop the player',
    //             },
    //         ])
    //         .then((res) => {
    //             console.log(`messages deployed for ${fetchedGuild.name}`);
    //         });
    // });

    client.user?.setStatus('dnd');
    client.user?.setPresence({ activities: [{ name: 'with MEE6' }] });
});
client.on('error', console.error);
client.on('warn', console.warn);

const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
    },
});

player.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.on('trackStart', (queue: Queue<any>, track) => {
    queue.metadata?.send(`🎶 | Started playing: **${track.title} - ⏱ ${track.duration}** in **${queue.connection.channel.name}**!`);
});

player.on('trackAdd', (queue: Queue<any>, track) => {
    queue.metadata.send(`🎶 | Track **${track.title} - ⏱ ${track.duration}** queued!`);
});

player.on('botDisconnect', (queue: Queue<any>) => {
    queue.metadata.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
});

player.on('channelEmpty', (queue: Queue<any>) => {
    queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
});

player.on('queueEnd', (queue: Queue<any>) => {
    queue.metadata.send('✅ | Queue finished!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guildId) return;

    if (!message.content.startsWith(prefix)) return;

    const command = message.content.replace(prefix, '').split(' ')[0].trim();

    const rand = Math.floor(Math.random() * 10);

    if (message.member?.id === '476064362537156619' && rand === 5) {
        message.reply({ content: denyMessages[Math.floor(Math.random() * denyMessages.length)] });
        return;
    }

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
        const query: any = message.content.replace(prefix + command, '');
        const searchResult = await player
            .search(query, {
                requestedBy: message.author,
                searchEngine: QueryType.AUTO,
            })
            .catch(() => {});
        if (!searchResult || !searchResult.tracks.length) return void message.channel.send({ content: 'No results were found!' });

        if (!message.guild) return void console.log('unknown error');

        const queue =
            player.getQueue(message.guildId) ||
            player.createQueue(message.guild, {
                metadata: message.channel,
                autoSelfDeaf: false,
                spotifyBridge: true,
                leaveOnEnd: false,
            });

        try {
            if (!message.member?.voice.channelId) return;
            if (!queue.connection) await queue.connect(message.member.voice.channelId);
        } catch {
            void player.deleteQueue(message.guildId);
            message.channel.send({ content: 'Could not join your voice channel!' });
            return;
        }

        await message.channel.send({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...` });
        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
        if (!queue.playing) {
            await queue.play();
        }
    } else if (commands.isSkip(command)) {
        const queue = player.getQueue(message.guildId);
        if (!queue || !queue.playing) return void message.channel.send({ content: '❌ | No music is being played!' });
        const currentTrack = queue.current;
        const success = queue.skip();
        return void message.channel.send({
            content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | Something went wrong!',
        });
    } else if (commands.isStop(command)) {
        const queue = player.getQueue(message.guildId);
        if (!queue || !queue.playing) return void message.channel.send({ content: '❌ | No music is being played!' });
        queue.destroy();
        return void message.channel.send({ content: '🛑 | Stopped the player!' });
    } else if (commands.isQueue(command)) {
        const queue = player.getQueue(message.guildId);
        if (!queue) return;
        const list = queue.tracks.map((track, i) => {
            return `**${i + 1}: ${track}**`;
        });

        if (list.length === 0) return void message.channel.send({ content: '❌ | Queue is empty' });
        return void message.channel.send({ content: `**Current Queue**\n\n${list.join('\n')}` });
    } else if (commands.isClear(command)) {
        const queue = player.getQueue(message.guildId);
        if (!queue) return;
        queue.clear();
        return void message.channel.send({ content: '✅ | Cleared the queue!' });
    } else if (commands.isSeek(command)) {
        const queue = player.getQueue(message.guildId);
        if (!queue || !queue.playing) return;
        const query: any = message.content.replace(prefix, '').split(' ')[1].trim();
        const success = await queue.seek(Math.ceil(parseInt(query) * 1000));
        return void message.channel.send({
            content: `${success ? `✅ | Seeked to ${query}` : `❌ | Something went wrong!`}`,
        });
    } else if (command == 'h' || command == 'help') {
        message.reply(`**All commands**\n\n${commands.format()}`);
    } else {
        message.reply({
            content: 'Unknown command!',
        });
    }
});

client.login(process.env.TOKEN);
