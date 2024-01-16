import QueueController from './queueController.js';

export default class GuildQueueController {
    static queueControllers: any = [];

    static getGuildQueueController(targetGuildId: string) {
        let queueController = GuildQueueController.queueControllers.find((obj: any) => obj.guildId === targetGuildId);

        if (!queueController) {
            const newQueueController = new QueueController();
            newQueueController.guildId = targetGuildId;

            const obj = {
                guildId: targetGuildId,
                queueController: newQueueController,
            };

            GuildQueueController.queueControllers.push(obj);

            queueController = obj;
        }

        return queueController;
    }
}
