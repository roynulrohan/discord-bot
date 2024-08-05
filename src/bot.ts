import { REST } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { Player } from 'discord-player';

import eventHandler from './handlers/eventHandler'; //temp
import config from './config';
import { YoutubeiExtractor } from 'discord-player-youtubei';

const token = config.token!;
const rest = new REST({ version: '10' }).setToken(token);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highest',
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
    },
});

client.player.extractors.register(YoutubeiExtractor, {
    streamOptions: {
        useClient: 'ANDROID',
    },
});

client.player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

eventHandler(client, rest);

client.login(token);
