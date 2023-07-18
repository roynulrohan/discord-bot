import { Client, GuildMember, GatewayIntentBits } from 'discord.js';
import { EqualizerConfigurationPreset, Player, QueryType } from 'discord-player';
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
const commands = new Commands();

client.on('ready', async () => {
    console.log(`${client.user?.tag} is online!`);

    client.user?.setStatus('dnd');
    client.user?.setPresence({ activities: [{ name: "with YGCamel's balls" }] });
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

player.events.on('error', (queue, error) => {
    // Emitted when the player queue encounters error
    console.log(`General player error event: ${error.message}`);
    console.log(error);
});

player.events.on('playerError', (queue, error) => {
    // Emitted when the audio player errors while streaming audio track
    console.log(`Player error event: ${error.message}`);
    console.log(error);
});

player.events.on('playerStart', (queue: any, track) => {
    queue.filters.equalizer?.setEQ(EqualizerConfigurationPreset.Flat);
    queue.metadata.channel.send(`🎶 | Started playing: **${track.title} - ⏱ ${track.duration}** in **${queue.channel.name}**!`);
});

player.events.on('playerSkip', (queue: any, track) => {
    queue.metadata.channel.send(`🎶 | **${track.title} - ⏱ ${track.duration}** was skipped.`);
});

player.events.on('audioTrackAdd', (queue: any, track) => {
    queue.metadata.channel.send(`🎶 | Track **${track.title} - ⏱ ${track.duration}** queued!`);
});

player.events.on('audioTracksAdd', (queue: any, tracks) => {
    queue.metadata.channel.send(`🎶 | ${tracks.length} tracks queued!`);
});

player.events.on('disconnect', (queue: any) => {
    queue.metadata.channel.send('❌ | I was disconnected from the voice channel, clearing queue!');
});

player.events.on('emptyChannel', (queue: any) => {
    queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...');
});

player.events.on('emptyQueue', (queue: any) => {
    queue.metadata.channel.send('✅ | Queue finished!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guildId) return;

    if (!message.content.startsWith(prefix)) return;

    const command = message.content.replace(prefix, '').split(' ')[0].trim();

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
            player.queues.get(message.guildId) ||
            player.queues.create(message.guildId, {
                metadata: {
                    channel: message.channel,
                    client: message.guild.members.me,
                    requestedBy: message.author,
                },
                leaveOnEnd: false,
                selfDeaf: false,
                skipOnNoStream: true,
            });

        try {
            if (!message.member?.voice.channelId) return;
            if (!queue.connection) await queue.connect(message.member.voice.channelId);
        } catch {
            void player.queues.delete(message.guildId);
            message.channel.send({ content: 'Could not join your voice channel!' });
            return;
        }

        await message.channel.send({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...` });
        queue.addTrack(searchResult.playlist ? searchResult.tracks : searchResult.tracks[0]);
        if (!queue.isPlaying()) {
            queue.node.play();
        }
    } else if (commands.isSkip(command)) {
        const queue = player.queues.get(message.guildId);
        if (!queue || !queue.isEmpty) return void message.channel.send({ content: '❌ | No music is being played!' });
        const currentTrack = queue.currentTrack;
        const success = queue.node.skip();
        return void message.channel.send({
            content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | Something went wrong!',
        });
    } else if (commands.isStop(command)) {
        const queue = player.queues.get(message.guildId);
        if (!queue || !queue.isPlaying()) return void message.channel.send({ content: '❌ | No music is being played!' });
        queue.delete();
        return void message.channel.send({ content: '🛑 | Stopped the player!' });
    } else if (commands.isQueue(command)) {
        const queue = player.queues.get(message.guildId);
        if (!queue) return;
        const list = queue.tracks.map((track, i) => {
            return `**${i + 1}: ${track}**`;
        });

        if (list.length === 0) return void message.channel.send({ content: '❌ | Queue is empty' });
        return void message.channel.send({ content: `**Current Queue**\n\n${list.join('\n')}` });
    } else if (commands.isClear(command)) {
        const queue = player.queues.get(message.guildId);
        if (!queue) return;
        queue.clear();
        return void message.channel.send({ content: '✅ | Cleared the queue!' });
    } else if (commands.isSeek(command)) {
        const queue = player.queues.get(message.guildId);
        if (!queue || !queue.isPlaying()) return;
        const query: any = message.content.replace(prefix, '').split(' ')[1].trim();
        const success = await queue.node.seek(Math.ceil(parseInt(query) * 1000));
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
