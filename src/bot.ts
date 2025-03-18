import { DefaultExtractors } from '@discord-player/extractor';
import { Player } from 'discord-player';
import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import { registerCommands } from './utils/commandHandler';
import { registerDiscordEvents } from './events/discordEvents';
import { registerPlayerEvents } from './events/playerEvents';
import { ClientWithPlayer } from './types';
import { SoundCloudExtractor } from '@discord-player/extractor';
import { VimeoExtractor } from '@discord-player/extractor';
import play from 'play-dl'; // Required for YouTube and Spotify support
import { YoutubeiExtractor } from 'discord-player-youtubei';

// Get bot token and client ID from config
const token = config.token!;
const clientId = config.clientId!;

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
}) as ClientWithPlayer;

// Initialize Discord Player
const player = new Player(client, {
    blockExtractors: [
        SoundCloudExtractor.identifier,
        VimeoExtractor.identifier,
    ]
});
client.player = player;

// Load player extractors for different sources (YouTube, Spotify, etc.)
player.extractors.loadMulti(DefaultExtractors);
player.extractors.register(YoutubeiExtractor, {})

// Set up play-dl for YouTube
if (process.env.YT_COOKIE) {
    play.setToken({
        youtube: {
            cookie: process.env.YT_COOKIE
        }
    });
}

// Register Discord and Player events
registerDiscordEvents(client);
registerPlayerEvents(player);

// Login to Discord
client.login(token).then(async () => {
    console.log('Logged in successfully!');

    // Register slash commands
    await registerCommands(clientId, token);
}).catch(error => {
    console.error('Failed to login:', error);
});
