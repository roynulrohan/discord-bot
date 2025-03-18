import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useQueue } from 'discord-player';

const command = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Set the volume for music playback')
  .addIntegerOption(option => 
    option.setName('level')
      .setDescription('Volume level (0-100)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(100));

const volume: BotCommand = {
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

      const volumeLevel = interaction.options.getInteger('level', true);
      
      // Set the volume
      queue.node.setVolume(volumeLevel);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔊 Volume Changed')
        .setDescription(`Volume has been set to **${volumeLevel}%**`)
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error('Volume command error:', err);
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

export default volume; 