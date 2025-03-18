import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { QueryType, useMainPlayer } from 'discord-player';
import { BotCommand } from '../types';

const play: BotCommand = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube or Spotify')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song URL or search term')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // Defer the reply since this might take some time
        await interaction.deferReply();

        const query = interaction.options.getString('song');

        // Debug logging
        console.log('Received query:', query);

        // Validate query
        if (!query) {
            await interaction.followUp({
                content: 'Please provide a search term or URL to play!',
                ephemeral: true
            });
            return;
        }

        // Check if the user is in a voice channel
        if (!interaction.guild) {
            await interaction.followUp({
                content: 'This command can only be used in a server!',
                ephemeral: true
            });
            return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            await interaction.followUp({
                content: 'You need to be in a voice channel to use this command!',
                ephemeral: true
            });
            return;
        }

        // Check if bot is already in a different voice channel
        if (
            interaction.guild.members.me?.voice.channel &&
            interaction.guild.members.me.voice.channel !== voiceChannel
        ) {
            await interaction.followUp({
                content: 'I am already playing in a different voice channel!',
                ephemeral: true
            });
            return;
        }

        // Check permissions
        if (!voiceChannel.permissionsFor(interaction.guild.members.me!)?.has(PermissionsBitField.Flags.Connect)) {
            await interaction.followUp({
                content: 'I do not have permission to join your voice channel!',
                ephemeral: true
            });
            return;
        }

        if (!voiceChannel.permissionsFor(interaction.guild.members.me!)?.has(PermissionsBitField.Flags.Speak)) {
            await interaction.followUp({
                content: 'I do not have permission to speak in your voice channel!',
                ephemeral: true
            });
            return;
        }

        try {
            const player = useMainPlayer();
            
            console.log('Playing song with query:', query);
            
            // Using the simpler play method directly
            const result = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { 
                        channel: interaction.channel,
                        client: interaction.client
                    },
                    leaveOnEnd: false,
                    leaveOnStop: false,
                    leaveOnEmpty: true,
                    selfDeaf: true
                },
                requestedBy: interaction.user
            });
            
            console.log('Play result:', {
                success: !!result,
                trackTitle: result?.track?.title,
                queueSize: result?.queue?.tracks?.size
            });

            if (!result || !result.track) {
                console.log('No track found for query:', query);
                await interaction.followUp({ content: '❌ No results found!' });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎵 Added to Queue')
                .setDescription(`Added [${result.track.title}](${result.track.url})`)
                .addFields({ name: 'Duration', value: result.track.duration });

            // Only set thumbnail if it exists and is valid
            if (result.track.thumbnail && result.track.thumbnail.length > 0) {
                embed.setThumbnail(result.track.thumbnail);
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (err) {
            console.error('Play command error:', err);
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

export default play; 