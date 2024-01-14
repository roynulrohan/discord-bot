import { EqualizerConfigurationPreset, Player, QueryType } from 'discord-player';
import { Message, Client } from 'discord.js';
import { PREFIX } from './app';

let player: Player;

export const initPlayer = (client: Client<boolean>) => {
    player = new Player(client, {
        ytdlOptions: {
            quality: 'highest',
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
};

export const play = async (search: string, message: Message<boolean>) => {
    const searchResult = await player
        .search(search.trim(), {
            requestedBy: message.author,
            searchEngine: QueryType.AUTO,
        })
        .catch(() => {});
    if (!searchResult || !searchResult.tracks.length) return void message.channel.send({ content: 'No results were found!' });

    if (!message.guild) return void console.log('Unknown error');

    const queue =
        player.queues.get(message.guildId!) ||
        player.queues.create(message.guildId!, {
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
        void player.queues.delete(message.guildId!);
        message.channel.send({ content: 'Could not join your voice channel!' });
        return;
    }

    await message.channel.send({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...` });
    queue.addTrack(searchResult.playlist ? searchResult.tracks : searchResult.tracks[0]);
    if (!queue.isPlaying()) {
        queue.node.play();
    }
};

export const pause = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue || !queue.isPlaying()) return;
    const success = queue.node.pause();
    return void message.channel.send({
        content: `${success ? `⏸️ | Paused!` : `❌ | Something went wrong!`}`,
    });
};

export const resume = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue || !queue.node.isPaused()) return void message.channel.send({ content: 'Please provide a search query!' });

    queue.node.resume();

    return void message.channel.send({
        content: `▶️ | Continuing!`,
    });
};

export const skip = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue || !queue.isEmpty) return void message.channel.send({ content: '❌ | No music is being played!' });
    const currentTrack = queue.currentTrack;
    const success = queue.node.skip();
    return void message.channel.send({
        content: success ? `⏭️ | Skipped **${currentTrack}**!` : '❌ | Something went wrong!',
    });
};

export const stop = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue || !queue.isPlaying()) return void message.channel.send({ content: '❌ | No music is being played!' });
    queue.delete();
    return void message.channel.send({ content: '🛑 | Stopped the player!' });
};

export const getQueue = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue) return;
    const list = queue.tracks.map((track, i) => {
        return `**${i + 1}: ${track}**`;
    });

    if (list.length === 0) return void message.channel.send({ content: '❌ | Queue is empty' });
    return void message.channel.send({ content: `**Current Queue**\n\n${list.join('\n')}` });
};

export const clear = (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue) return;
    queue.clear();
    return void message.channel.send({ content: '✅ | Cleared the queue!' });
};

export const seek = async (message: Message<boolean>) => {
    const queue = player.queues.get(message.guildId!);
    if (!queue || !queue.isPlaying()) return;
    const query: any = message.content.replace(PREFIX, '').split(' ')[1].trim();
    const success = await queue.node.seek(Math.ceil(parseInt(query) * 1000));
    return void message.channel.send({
        content: `${success ? `✅ | Seeked to ${query}` : `❌ | Something went wrong!`}`,
    });
};
