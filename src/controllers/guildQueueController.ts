import QueueController from './queueController';

type QueueControllerObj = {
    guildId: string;
    queueController: QueueController;
};
export default class GuildQueueController {
    static queueControllers: QueueControllerObj[] = [];

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
