import { VoiceBasedChannel } from 'discord.js';

export default (clientId: string, channel: VoiceBasedChannel) => (!channel.members.get(clientId) ? false : true);
