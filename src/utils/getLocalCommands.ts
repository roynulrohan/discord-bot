import path from 'path';
import getAllFilesFromPath from './getAllFilesFromPath';

export default async (exceptions = []) => {
    const foldersPath = path.join(__dirname, '..', 'commands');
    const commandCategories = getAllFilesFromPath(foldersPath, true);
    const localCommands = [];

    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFilesFromPath(commandCategory);

        for (const commandFile of commandFiles) {
            const fileNameAndParent = commandFile.replace(/\\/g, '/').split('/').slice(-2);

            try {
                const commandObject: any = await import(`../commands/${fileNameAndParent[0]}/${fileNameAndParent[1]}`);

                if (commandObject.default.name && !exceptions.includes(commandObject.default.name as never)) {
                    localCommands.push(commandObject.default);
                }
            } catch (error) {
                console.log('\nThere was an error while importing object: ' + error);
            }
        }
    }

    return localCommands;
};
