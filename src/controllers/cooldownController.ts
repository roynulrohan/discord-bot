export default class CooldownController {
    static guildCooldown: string[] = [];
    static cooldownTime = 0;

    static applyCooldown(targetGuildId: string) {
        CooldownController.guildCooldown.push(targetGuildId);

        setTimeout(() => {
            CooldownController.guildCooldown = CooldownController.guildCooldown.filter((guildId) => guildId !== targetGuildId);
        }, CooldownController.cooldownTime);
    }

    static isOnCooldown(targetGuildId: string) {
        const isGuildOnCooldown = CooldownController.guildCooldown.find((guildId) => guildId === targetGuildId);

        return isGuildOnCooldown ? true : false;
    }
}
