import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useQueue } from 'discord-player';

const command = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Shows information about the currently playing song');

const nowplaying: BotCommand = {
  data: command,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    if (!interaction.guild) {
      await interaction.followUp({ 
        content: 'This command can only be used in a server!',
        ephemeral: true 
      });
      return;
    }

    try {
      // Get the queue for the guild
      const queue = useQueue(interaction.guild.id);

      if (!queue || !queue.node.isPlaying()) {
        await interaction.followUp({
          content: 'No music is currently playing!',
          ephemeral: true
        });
        return;
      }

      const currentTrack = queue.currentTrack;
      
      if (!currentTrack) {
        await interaction.followUp({
          content: 'There is no track currently playing!',
          ephemeral: true
        });
        return;
      }

      const progress = queue.node.getTimestamp();
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎵 Now Playing')
        .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
        .addFields(
          { name: 'Duration', value: currentTrack.duration, inline: true },
          { name: 'Requested By', value: `<@${currentTrack.requestedBy?.id || 'Unknown'}>`, inline: true }
        )
        .setTimestamp();
      
      // Add progress bar if available
      if (progress) {
        embed.addFields({
          name: 'Progress',
          value: `${progress.current.label} / ${progress.total.label}`
        });
      }
      
      // Only set thumbnail if it exists and is valid
      if (currentTrack.thumbnail && currentTrack.thumbnail.length > 0) {
        embed.setThumbnail(currentTrack.thumbnail);
      }

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error('NowPlaying command error:', err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      await interaction.followUp({ 
        content: '❌ There was an error processing your request. Please try again later.',
        ephemeral: true 
      });
    }
  }
};

export default nowplaying; 