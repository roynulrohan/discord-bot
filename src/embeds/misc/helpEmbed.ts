import { InteractionReplyOptions } from 'discord.js';

export const helpEmbed = () => {
    const embed: InteractionReplyOptions = {
        embeds: [
            {
                author: {
                    name: `Slay_404`,
                    icon_url: '',
                },
                color: 15418782,
                description: `:syringe: **Music Bot V14** supports youtube links, queries and playlists.`,
                title: 'Meowdy Partner - Music',
                fields: [
                    {
                        name: 'Commands',
                        value: `\n:loud_sound: **/play url** - Paste a link.\n**:loud_sound: /play search** - Searched for music.\n:loud_sound: **/play playlist** - Play from a playlist.\n:pause_button: **/pause** - Pause a music.\n:play_pause: **/resume** - Resume a music.\n:track_next: **/skip** - Skip a music.\n:x: **/stop** - Stop a music.`,
                    },
                ],
            },
        ],
        ephemeral: true,
    };

    return embed;
};
