import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';
import { BotCommand } from '../types';
import { useMainPlayer } from 'discord-player';

const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song in your voice channel')
    .addStringOption(option =>
        option.setName('song')
            .setDescription('The song you want to play')
            .setRequired(true));

const play: BotCommand = {
    data: command,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // Get the player instance and song query
        const player = useMainPlayer();
        const query = interaction.options.getString('song', true);

        // Get the voice channel of the user and check permissions
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            interaction.reply(
                'You need to be in a voice channel to play music!',
            );
            return;
        }

        if (
            interaction.guild?.members.me?.voice.channel &&
            interaction.guild.members.me.voice.channel !== voiceChannel
        ) {
            interaction.reply(
                'I am already playing in a different voice channel!',
            );
            return;
        }

        if (
            !voiceChannel
                .permissionsFor(interaction.guild!.members.me!)
                .has(PermissionsBitField.Flags.Connect)
        ) {
            interaction.reply(
                'I do not have permission to join your voice channel!',
            );
            return;
        }

        if (
            !voiceChannel
                .permissionsFor(interaction.guild!.members.me!)
                .has(PermissionsBitField.Flags.Speak)
        ) {
            interaction.reply(
                'I do not have permission to speak in your voice channel!',
            );
            return;
        }

        try {
            // Play the song in the voice channel
            const result = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
                    selfDeaf: false,
                },
            });

            // Reply to the user that the song has been added to the queue
            interaction.reply(
                `${result.track.title} has been added to the queue!`,
            );
        } catch (error) {
            // Handle any errors that occur
            console.error(error);
            interaction.reply('An error occurred while playing the song!');
        }
    }
};

export default play;
