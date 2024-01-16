import { Client, GuildMember, PermissionFlagsBits } from 'discord.js';
import getLocalCommands from '../../utils/getLocalCommands';
import CooldownController from '../../controllers/cooldownController';
import { getCooldownEmbed } from '../../embeds/music/exceptionsEmbed';

type Params = {
    client: Client;
    args: {
        guildId: string;
        commandName: string;
        reply: (arg0: any) => void;
        isChatInputCommand: () => any;
        member: GuildMember;
    };
};

export default async ({ client, args }: Params) => {
    if (!args.isChatInputCommand()) return;

    if (CooldownController.isOnCooldown(args.guildId)) {
        return args.reply(getCooldownEmbed());
    }

    const localCommands = await getLocalCommands();

    const commandObject = localCommands.find((cmd) => cmd.name === args.commandName);

    if (!commandObject) return;

    if (commandObject.default_member_permissions) {
        if (!args.member.permissions.has(PermissionFlagsBits.Administrator)) {
            args.reply({
                content: 'You do not have the required permissions to run this command.',
                ephemeral: true,
            });
            return;
        }
    }

    CooldownController.applyCooldown(args.guildId);

    await commandObject.callback(client, args);
};
