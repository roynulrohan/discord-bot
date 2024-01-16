import { Playlist, RawTrackData, Track } from 'discord-player';
import { InteractionReplyOptions } from 'discord.js';
import { getPlayButtonRow } from './buttonRowEmbed.js';

export function getPlaySongEmbed(channel: string, isPlaying: boolean, song: Track<unknown>, addedBy: string) {
    const buttonRow = getPlayButtonRow();

    const embed = {
        footer: {
            text: `Duration: ${song.duration}\nChannel: #${channel}.\nAdded by : @${addedBy}`,
            icon_url: '',
        },
        image: {
            url: song.thumbnail,
        },
        thumbnail: {
            url: '',
        },
        author: {
            name: 'Slay_404',
            icon_url: '',
        },
        fields: [],
        color: 15418782,
        type: 'rich',
        description: `🎶 | Started playing: **${song.title}**!`,
        title: 'Meowdy Partner - Music',
    };

    return !isPlaying
        ? ({
              embeds: [embed],
              components: [buttonRow],
          } as InteractionReplyOptions)
        : ({
              embeds: [embed],
          } as InteractionReplyOptions);
}

export function getPlayPlaylistEmbed(
    playlistTitle: string,
    playlistLength: number,
    playlistUrl: string,
    playlistAuthor: string,
    playlistCurrentPosition: number,
    addedBy: string,
    currentTrack: RawTrackData
) {
    const buttonRow = getPlayButtonRow();

    const embed = {
        footer: {
            text: `Duration: ${currentTrack.duration}\nProgress: song ${playlistCurrentPosition} by ${playlistLength}.\nAuthor: ${playlistAuthor}.\nAdded by: ${addedBy}.`,
            icon_url: '',
        },
        image: {
            url: currentTrack.thumbnail,
        },
        thumbnail: {
            url: '',
        },
        author: {
            name: 'Slay_404',
            icon_url: '',
        },
        fields: [],
        color: 15418782,
        type: 'rich',
        description: `🎶 | Currently playing **${currentTrack.title}** from the playlist "**[${playlistTitle}](${playlistUrl})**".`,
        title: 'Meowdy Partner - Music',
    };

    return {
        embeds: [embed],
        components: [buttonRow],
    } as InteractionReplyOptions;
}

export function getPlaylistAddedEmbed(playlist: Playlist, addedBy: string) {
    const embed = {
        footer: {
            text: `Size: ${playlist.tracks.length} songs.\nAuthor: ${playlist.author.name}.\nAdded by: ${addedBy}.`,
            icon_url: '',
        },
        image: {
            url: playlist.thumbnail,
        },
        thumbnail: {
            url: '',
        },
        author: {
            name: 'Slay_404',
            icon_url: '',
        },
        fields: [],
        color: 15418782,
        type: 'rich',
        description: `The playlist "**[${playlist.title}](${playlist.url})**" has been added to the playlist.`,
        title: 'Meowdy Partner - Music',
    };

    return {
        embeds: [embed],
    } as InteractionReplyOptions;
}
