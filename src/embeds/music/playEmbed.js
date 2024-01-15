import { getPlayButtonRow } from "./buttonRowEmbed.js";

export function getPlaySongEmbed(channel, isPlaying, song, addedBy) {
  const buttonRow = getPlayButtonRow();

  const embed = {
    footer: {
      text: `Duration: ${song.duration}\nChannel: #${channel}.\nAdded by : @${addedBy}`,
      icon_url: "",
    },
    image: {
      url: song.thumbnail,
    },
    thumbnail: {
      url: "",
    },
    author: {
      name: "Slay_404",
      icon_url: "",
    },
    fields: [],
    color: 15418782,
    type: "rich",
    description: `🎶 | Started playing: **${song.title}**!`,
    title: "Meowdy Partner - Music",
  };

  return !isPlaying
    ? {
        embeds: [embed],
        components: [buttonRow],
      }
    : {
        embeds: [embed],
      };
}

export function getPlayPlaylistEmbed(
  playlistTitle,
  playlistLength,
  playlistUrl,
  playlistAuthor,
  playlistCurrentPosition,
  addedBy,
  currentTrack
) {
  const buttonRow = getPlayButtonRow();

  const embed = {
    footer: {
      text: `Duration: ${currentTrack.durationFormatted}\nProgress: song ${playlistCurrentPosition} by ${playlistLength}.\nAuthor: ${playlistAuthor}.\nAdded by: ${addedBy}.`,
      icon_url: "",
    },
    image: {
      url: currentTrack.thumbnail.url,
    },
    thumbnail: {
      url: "",
    },
    author: {
      name: "Slay_404",
      icon_url: "",
    },
    fields: [],
    color: 15418782,
    type: "rich",
    description: `🎶 | Currently playing **${currentTrack.title}** from the playlist "**[${playlistTitle}](${playlistUrl})**".`,
    title: "Meowdy Partner - Music",
  };

  return {
    embeds: [embed],
    components: [buttonRow],
  };
}

export function getPlaylistAddedEmbed(playlist, addedBy) {
  const embed = {
    footer: {
      text: `Size: ${playlist.tracks.length} songs.\nAuthor: ${playlist.author.name}.\nAdded by: ${addedBy}.`,
      icon_url: "",
    },
    image: {
      url: playlist.thumbnail,
    },
    thumbnail: {
      url: "",
    },
    author: {
      name: "Slay_404",
      icon_url: "",
    },
    fields: [],
    color: 15418782,
    type: "rich",
    description: `The playlist "**[${playlist.title}](${playlist.url})**" has been added to the playlist.`,
    title: "Meowdy Partner - Music",
  };

  return {
    embeds: [embed],
  };
}
