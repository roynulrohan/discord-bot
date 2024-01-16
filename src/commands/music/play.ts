import { GuildNodeCreateOptions, GuildQueue, Playlist, QueryType } from 'discord-player';
import { Client, CommandInteraction, ComponentType, Guild, GuildMember, InteractionReplyOptions, MessagePayload } from 'discord.js';
import CooldownController from '../../controllers/cooldownController';
import GuildQueueController from '../../controllers/guildQueueController';
import { getPausedButtonRow, getPlayButtonRow } from '../../embeds/music/buttonRowEmbed';
import { getCooldownEmbed } from '../../embeds/music/exceptionsEmbed';
import pauseEmbed from '../../embeds/music/pauseEmbed';
import { getPlaylistAddedEmbed, getPlayPlaylistEmbed, getPlaySongEmbed } from '../../embeds/music/playEmbed';
import resumeEmbed from '../../embeds/music/resumeEmbed';
import skipEmbed from '../../embeds/music/skipEmbed';
import stopEmbed from '../../embeds/music/stopEmbed';
import checkMemberName from '../../utils/checkMemberName';
import isUserConnectedToBotChannel from '../../utils/isUserConnectedToBotChannel';

export default {
    name: 'play',
    description: 'Play a song',
    options: [
        {
            type: 3,
            name: 'song',
            description: 'search keywords, name, or url',
            required: true,
        },
    ],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const channel = (interaction.member as GuildMember).voice.channel;

        if (!channel)
            return interaction.reply({
                content: 'You need to be in a voice channel to play a song.',
                ephemeral: true,
            });

        if (!channel.permissionsFor(interaction.guild?.members.me!).has('ViewChannel')) {
            return await interaction.reply({
                content: 'Bot is not allowed to play on this channel!',
                ephemeral: true,
            });
        }

        let queue: GuildQueue;

        if (!client.player.nodes.has(interaction.guild!)) {
            const options: GuildNodeCreateOptions = {
                leaveOnEnd: false,
                selfDeaf: false,
            };

            queue = client.player.nodes.create(interaction.guild!, options);
        } else {
            queue = client.player.nodes.get(interaction.guild!)!;

            if (!isUserConnectedToBotChannel(client.user?.id!, channel)) {
                return await interaction.reply({
                    content: 'You must be on the same channel as the bot!',
                    ephemeral: true,
                });
            }
        }

        const queueController = GuildQueueController.getGuildQueueController(interaction.guildId!)?.queueController;

        if (!queue.connection) await queue.connect((interaction.member as GuildMember).voice.channel!);

        let embed: string | MessagePayload | InteractionReplyOptions;
        let playlist: Playlist | undefined;

        const songField = interaction.options.get('song')?.value as string;

        const result = await client.player.search(songField, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });

        if (result.tracks.length === 0) {
            return interaction.reply({
                content: 'No results found on this link!.',
                ephemeral: true,
            });
        }

        if (result.hasPlaylist()) {
            playlist = result.playlist!;

            queue.addTrack(playlist);

            if (!queue.isPlaying()) {
                queueController.anyPlaylistOngoing = true;

                embed = getPlayPlaylistEmbed(
                    playlist.title,
                    playlist.tracks.length,
                    playlist.url,
                    playlist.author.name,
                    1,
                    checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username),
                    playlist.tracks[0].raw
                );
            } else {
                embed = getPlaylistAddedEmbed(
                    playlist,
                    checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username)
                );
            }
        } else {
            const song = result.tracks[0];
            queue.addTrack(song);

            embed = getPlaySongEmbed(
                (interaction.member as GuildMember).voice.channel?.name!,
                queue.isPlaying(),
                song,
                checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username)
            );
        }

        await interaction.deferReply();

        try {
            if (!queue.isPlaying()) {
                await queue.node.play();

                queueController.setTrackMoveEventListener(queue);
            }

            const reply = await interaction.followUp(embed);

            queueController.queueReply.push(reply);

            if (playlist) {
                queueController.playlists.push({
                    id: queueController.playlists.length + 1,
                    startIndex: queueController.queueReply.length - 1,
                    length: playlist.tracks.length,
                    author: playlist.author.name,
                    title: playlist.title,
                    url: playlist.url,
                    reply,
                    addedBy: checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username),
                });
            }

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

            collector.on('collect', async (interaction) => {
                if (CooldownController.isOnCooldown(interaction.guildId!)) {
                    return void interaction.reply(getCooldownEmbed());
                }

                if (!queue) {
                    return void (await interaction.reply({
                        content: 'There are no songs in the queue.',
                        ephemeral: true,
                    }));
                }

                if ((interaction.member as GuildMember).voice.channel) {
                    if (!isUserConnectedToBotChannel(client.user?.id!, (interaction.member as GuildMember).voice.channel!)) {
                        return void (await interaction.reply({
                            content: 'You must be on the same channel as the bot!',
                            ephemeral: true,
                        }));
                    }
                } else {
                    return void (await interaction.reply({
                        content: 'You need to be on the server to interact with the bot!',
                        ephemeral: true,
                    }));
                }

                CooldownController.applyCooldown(interaction.guildId!);

                if (interaction.customId == 'stop') {
                    try {
                        queueController.stopCommandIssued = true;

                        queue.delete();

                        return void interaction.reply(
                            stopEmbed(checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username))
                        );
                    } catch (error) {
                        console.log(
                            `\nError while stop button was pressed on the server: ${interaction.guild?.name} / Id: ${
                                (interaction.guild as Guild).id
                            }. Error: ${error}`
                        );
                        return;
                    }
                }

                if (interaction.customId == 'skip') {
                    try {
                        queue.node.skip();

                        await interaction.reply(
                            skipEmbed(
                                queue.currentTrack?.raw.title!,
                                checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username)
                            )
                        );

                        setTimeout(async () => {
                            await interaction.deleteReply();

                            return;
                        }, 2500);
                    } catch (error) {
                        console.log(
                            `\nError while skip button was pressed on the server: ${interaction.guild?.name} / Id: ${interaction.guild?.id}. Error: ${error}`
                        );
                        return;
                    }
                }

                if (interaction.customId == 'pause') {
                    try {
                        if (queue.node.isPlaying()) {
                            queue.node.pause();

                            const currentReply = queueController.queueReply[queueController.currentTrackIndex];

                            currentReply.edit({ components: [getPausedButtonRow()] });

                            await interaction.reply(
                                pauseEmbed(
                                    queue.currentTrack?.raw.title!,
                                    checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username)
                                )
                            );

                            setTimeout(async () => {
                                await interaction.deleteReply();

                                return;
                            }, 2500);
                        } else {
                            await interaction.reply({
                                content: 'Bot is already paused!',
                                ephemeral: true,
                            });

                            setTimeout(async () => {
                                await interaction.deleteReply();

                                return;
                            }, 2500);
                        }
                    } catch (error) {
                        console.log(
                            `\nError while pause button was pressed on the server: ${interaction.guild?.name} / Id: ${interaction.guild?.id}. Error: ${error}`
                        );
                        return;
                    }
                }

                if (interaction.customId == 'resume') {
                    try {
                        if (queue.node.isPaused()) {
                            queue.node.resume();

                            const currentReply = queueController.queueReply[queueController.currentTrackIndex];

                            currentReply.edit({ components: [getPlayButtonRow(true)] });

                            await interaction.reply(
                                resumeEmbed(
                                    queue.currentTrack?.raw.title!,
                                    checkMemberName((interaction.member as GuildMember).nickname!, (interaction.member as GuildMember).user.username)
                                )
                            );

                            setTimeout(async () => {
                                await interaction.deleteReply();

                                return;
                            }, 2500);
                        } else {
                            await interaction.reply({
                                content: 'Bot is already playing!',
                                ephemeral: true,
                            });

                            setTimeout(async () => {
                                await interaction.deleteReply();

                                return;
                            }, 2500);
                        }
                    } catch (error) {
                        console.log(
                            `\nError while resume button was pressed on the server: ${interaction.guild?.name} / Id: ${interaction.guild?.id}. Error: ${error}`
                        );
                        return;
                    }
                }
            });

            return;
        } catch (error) {
            console.log(error);

            return interaction.reply({
                content: `There was an error, please try again. If it persists, report to the developer!.`,
                ephemeral: true,
            });
        }
    },
};
