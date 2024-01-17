import { InteractionReplyOptions } from 'discord.js';

export default (userNickname: string) => {
    return {
        embeds: [
            {
                footer: {
                    text: `Stopped by: ${userNickname}.`,
                    icon_url: '',
                },
                author: {
                    name: 'Slay_404',
                    icon_url: '',
                },
                color: 15418782,
                type: 'rich',
                description: '🛑 | Stopped song playback.',
                title: 'Meowdy Partner - Music',
            },
        ],
    } as InteractionReplyOptions;
};
