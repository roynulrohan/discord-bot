import { Client } from 'discord.js';

export default async (client: Client, guildId: string) => {
    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        return guild.commands.fetch();
    }
};
