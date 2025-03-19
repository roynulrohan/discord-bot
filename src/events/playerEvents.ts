import { Player } from 'discord-player';
import { EmbedBuilder, TextChannel } from 'discord.js';

export function registerPlayerEvents(player: Player): void {
  // When a track starts playing
  player.events.on('playerStart', (queue, track) => {
    try {
      const channel = queue.metadata.channel as TextChannel;

      const embed = new EmbedBuilder()
        .setColor(15418782)
        .setTitle(track.title)
        .setDescription(track.author).setURL(track.url).setFields({ name: 'Duration', value: track.duration, inline: true }, { name: 'Channel', value: `#${channel}`, inline: true }, { name: 'Added by', value: `<@${track.requestedBy?.id || 'Unknown'}>`, inline: true })
        .setTimestamp();

      // Only set thumbnail if it exists and is valid
      if (track.thumbnail && track.thumbnail.length > 0) {
        embed.setImage(track.thumbnail);
      }

      channel.send({ embeds: [embed] }).catch(err => {
        console.error('Failed to send now playing message:', err);
      });
    } catch (err) {
      console.error('Error in playerStart event:', err);
    }
  });

  // When the player encounters an error
  player.events.on('error', (queue, error) => {
    try {
      const channel = queue.metadata.channel as TextChannel;

      console.error(`Error in queue for guild ${queue.guild.name}:`, error);

      // Send a user-friendly error message
      channel.send({
        content: '❌ There was an error with the music playback. Please try again.'
      }).catch(err => {
        console.error('Failed to send error message:', err);
      });
    } catch (err) {
      console.error('Error handling player error event:', err);
    }
  });

  // When the queue finishes
  player.events.on('emptyQueue', queue => {
    try {
      const channel = queue.metadata.channel as TextChannel;

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('✅ Queue Finished')
        .setDescription('The queue has ended! Add more songs to keep the party going.')
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(err => {
        console.error('Failed to send empty queue message:', err);
      });
    } catch (err) {
      console.error('Error in emptyQueue event:', err);
    }
  });

  // When the player gets disconnected
  player.events.on('disconnect', queue => {
    try {
      const channel = queue.metadata.channel as TextChannel;

      channel.send('❌ I was disconnected from the voice channel.').catch(err => {
        console.error('Failed to send disconnect message:', err);
      });
    } catch (err) {
      console.error('Error in disconnect event:', err);
    }
  });

  // When the voice channel becomes empty
  player.events.on('emptyChannel', queue => {
    try {
      const channel = queue.metadata.channel as TextChannel;

      channel.send('❌ Nobody is in the voice channel, leaving...').catch(err => {
        console.error('Failed to send empty channel message:', err);
      });
    } catch (err) {
      console.error('Error in emptyChannel event:', err);
    }
  });
} 