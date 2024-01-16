import { ApplicationCommandOptionType, Client, CommandInteraction, GuildMember } from 'discord.js';

export default {
    name: 'seek',
    description: "Change the current track's position",
    options: [
        {
            type: ApplicationCommandOptionType.Integer,
            name: 'position',
            description: 'Track postion',
            required: true,
        },
    ],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const channel = (interaction.member as GuildMember).voice.channel;

        if (!channel)
            return interaction.reply({
                content: 'You need to be in a voice channel to interact with music functions.',
                ephemeral: true,
            });

        const queue = client.player.nodes.get(interaction.guild!);

        if (!queue) {
            await interaction.reply({
                content: 'There is nothing playing right now',
                ephemeral: true,
            });

            return;
        }

        const timestamp = interaction.options.get('position')?.value as number;

        await queue.node.seek(Math.ceil(timestamp * 1000));

        return void interaction.reply({
            content: `The track has been moved to ${timestamp} seconds.`,
            ephemeral: true,
        });
    },
};
