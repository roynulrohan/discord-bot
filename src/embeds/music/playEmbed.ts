import { Playlist, RawTrackData, Track } from 'discord-player';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { getPlayButtonRow } from './buttonRowEmbed';

export function getPlaySongEmbed(channel: string, isPlaying: boolean, song: Track<unknown>, addedBy: string) {
    const buttonRow = getPlayButtonRow();

    const embed = new EmbedBuilder();

    embed.setTitle(song.title);
    song.author && embed.setDescription(song.author);
    song.url && embed.setURL(song.url);
    embed.setColor(15418782);
    song.thumbnail && embed.setImage(song.thumbnail);
    embed.setFooter({ text: `Duration: ${song.duration}\nChannel: #${channel}\nAdded by : @${addedBy}` });

    const returnObject: InteractionReplyOptions = {
        content: `${song.url}`,
        embeds: [embed.data],
        components: !isPlaying ? [buttonRow] : [],
    };

    return returnObject;
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

    const embed = new EmbedBuilder();

    embed.setTitle(currentTrack.title);
    embed.setURL(currentTrack.url);
    embed.setDescription(`🎶 | Started playing: **${currentTrack.title}** from the playlist "**[${playlistTitle}](${playlistUrl})**".`);
    embed.setColor(15418782);
    currentTrack.thumbnail && embed.setImage(currentTrack.thumbnail);
    embed.setFooter({
        text: `Duration: ${currentTrack.duration}\nProgress: song ${playlistCurrentPosition} by ${playlistLength}\nAuthor: ${playlistAuthor}\nAdded by: ${addedBy}.`,
    });

    const returnObject: InteractionReplyOptions = {
        embeds: [embed.data],
        components: [buttonRow],
    };

    return returnObject;
}

export function getPlaylistAddedEmbed(playlist: Playlist, addedBy: string) {
    const embed = new EmbedBuilder();

    embed.setTitle(playlist.title);
    embed.setURL(playlist.url);
    embed.setDescription(`The playlist "**[${playlist.title}](${playlist.url})**" has been added to the queue.`);
    embed.setColor(15418782);
    playlist.thumbnail && embed.setImage(playlist.thumbnail);
    embed.setFooter({ text: `Size: ${playlist.tracks.length} songs\nAuthor: ${playlist.author.name}\nAdded by: ${addedBy}.` });

    const returnObject: InteractionReplyOptions = {
        embeds: [embed.data],
    };

    return returnObject;
}
