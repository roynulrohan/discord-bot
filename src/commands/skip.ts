import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useQueue } from 'discord-player';

const command = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skips the current song');

const skip: BotCommand = {
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

      // Store the current track before skipping
      const currentTrack = queue.currentTrack;
      
      if (!currentTrack) {
        await interaction.followUp({
          content: 'There is no track currently playing!',
          ephemeral: true
        });
        return;
      }

      // Skip the current song
      await queue.node.skip();

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⏭️ Skipped Track')
        .setDescription(`Skipped [${currentTrack.title}](${currentTrack.url})`);
      
      // Only set thumbnail if it exists and is valid
      if (currentTrack.thumbnail && currentTrack.thumbnail.length > 0) {
        embed.setThumbnail(currentTrack.thumbnail);
      }

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error('Skip command error:', err);
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

export default skip; 