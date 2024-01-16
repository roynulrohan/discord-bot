import { Client } from 'discord.js';

type Params = {
    client: Client;
};

export default ({ client }: Params) => console.log(`\n${client.user?.tag} is now online.\n`);
