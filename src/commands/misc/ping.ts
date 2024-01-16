import { Client, CommandInteraction } from 'discord.js';

export default {
    name: 'ping',
    description: 'Pong!',
    default_member_permissions: '8',

    callback: (client: Client, interaction: CommandInteraction) => {
        interaction.reply({
            content: `Pong! ${client.ws.ping}ms`,
            ephemeral: true,
        });
    },
};
