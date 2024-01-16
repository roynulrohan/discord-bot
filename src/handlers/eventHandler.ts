import { Client, REST } from 'discord.js';
import path from 'path';

import getAllFilesFromPath from '../utils/getAllFilesFromPath';

export default (client: Client, rest: REST) => {
    const foldersPath = path.join(__dirname, '..', 'events');
    const eventFolders = getAllFilesFromPath(foldersPath, true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFilesFromPath(eventFolder);
        eventFiles.sort((a, b) => a.localeCompare(b));
        const eventName: string = eventFolder.replace(/\\/g, '/').split('/').pop()!;

        client.on(eventName, async (args) => {
            for (const eventFile of eventFiles) {
                const fileName = eventFile.replace(/\\/g, '/').split('/').pop();

                try {
                    const eventFunction = await import(`../events/${eventName}/${fileName}`);
                    eventFunction.default({
                        client,
                        rest,
                        args,
                    });
                } catch (error) {
                    console.log('\nThere was an error while importing or executing an event function: ' + error);
                }
            }
        });
    }
};
