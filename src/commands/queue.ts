import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../types';
import { useQueue, Track } from 'discord-player';

const command = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the current music queue')
    .addNumberOption(option =>
        option.setName('page')
            .setDescription('Page number of the queue')
            .setRequired(false));

const queueCommand: BotCommand = {
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

            const totalPages = Math.ceil(queue.tracks.size / 10) || 1;
            const page = (interaction.options.getNumber('page') || 1) - 1;

            if (page < 0 || page >= totalPages) {
                await interaction.followUp({
                    content: `Invalid page. There are only ${totalPages} pages of songs!`,
                    ephemeral: true
                });
                return;
            }

            const queueString = queue.tracks.data.slice(page * 10, page * 10 + 10).map((song: Track, i: number) => {
                return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${song.title}](${song.url}) - <@${song.requestedBy?.id || 'Unknown'}>`;
            }).join("\n");

            const currentSong = queue.currentTrack;

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎵 Song Queue')
                .setDescription(`**Currently Playing:**\n` +
                    (currentSong ? `\`[${currentSong.duration}]\` [${currentSong.title}](${currentSong.url}) - <@${currentSong.requestedBy?.id || 'Unknown'}>` : "None") +
                    `\n\n**Queue:**\n${queueString || "No songs in queue."}`)
                .setFooter({
                    text: `Page ${page + 1} of ${totalPages}`
                })
                .setTimestamp();

            // Only set thumbnail if current song exists and has a valid thumbnail
            if (currentSong?.thumbnail && currentSong.thumbnail.length > 0) {
                embed.setThumbnail(currentSong.thumbnail);
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (err) {
            console.error('Queue command error:', err);
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

export default queueCommand; 