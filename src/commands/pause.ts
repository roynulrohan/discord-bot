import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useMainPlayer, useQueue } from 'discord-player';

const command = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pauses the currently playing track');

const pause: BotCommand = {
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

    // Check if the user is in a voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.followUp({
        content: 'You need to be in a voice channel to use this command!',
        ephemeral: true
      });
      return;
    }

    try {
      // Get the queue for the guild
      const queue = useQueue(interaction.guild.id);

      if (!queue || !queue.node.isPlaying()) {
        await interaction.followUp({
          content: 'There is no song playing!',
          ephemeral: true
        });
        return;
      }

      if (queue.node.isPaused()) {
        await interaction.followUp({
          content: 'The music is already paused!',
          ephemeral: true
        });
        return;
      }

      // Pause the queue
      queue.node.pause();

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⏸️ Paused')
        .setDescription('Music playback has been paused!')
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error('Pause command error:', err);
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

export default pause; 