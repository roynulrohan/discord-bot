import stopEmbed from '../../embeds/music/stopEmbed.js';
import GuildQueueController from '../../controllers/guildQueueController.js';
import checkMemberName from '../../utils/checkMemberName.js';
import { Client, CommandInteraction, GuildMember } from 'discord.js';

export default {
    name: 'stop',
    description: 'Stops current queue',

    callback: async (client: Client, interaction: CommandInteraction) => {
        const channel = (interaction.member as GuildMember).voice.channel;

        if (!channel)
            return interaction.reply({
                content: 'You need to be in a voice channel to play a song.',
                ephemeral: true,
            });

        const queue = client.player.nodes.get(interaction.guild!);

        if (!queue) {
            await interaction.reply({
                content: 'There are no songs in the queue.',
                ephemeral: true,
            });
            return;
        }

        const queueController = GuildQueueController.getGuildQueueController(interaction.guildId!).queueController;

        queueController.stopCommandIssued = true;

        try {
            queue.delete();

            return interaction.reply(stopEmbed(checkMemberName((interaction.member as GuildMember).nickname!, interaction.member?.user.username!)));
        } catch (error) {
            console.log(`\nError when the /stop command was issued on the server: ${interaction.guild?.name} / Id: ${interaction.guild?.id}. Error: ${error}`);
            return;
        }
    },
};
