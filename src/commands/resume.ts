import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useQueue } from 'discord-player';

const command = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resumes the currently paused track');

const resume: BotCommand = {
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

      if (!queue) {
        await interaction.followUp({
          content: 'There is no music playing!',
          ephemeral: true
        });
        return;
      }

      if (!queue.node.isPaused()) {
        await interaction.followUp({
          content: 'The music is not paused!',
          ephemeral: true
        });
        return;
      }

      // Resume the queue
      queue.node.resume();

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('▶️ Resumed')
        .setDescription('Music playback has been resumed!')
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error('Resume command error:', err);
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

export default resume; 