import { Client, CommandInteraction } from 'discord.js';

export default {
    name: 'help',
    description: 'help command!',

    callback: async (client: Client, interaction: CommandInteraction) => {
        return await interaction.reply({ embeds: [], ephemeral: true });
    },
};
