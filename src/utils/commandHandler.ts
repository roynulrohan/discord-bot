import { REST, Routes, Collection } from 'discord.js';
import { BotCommand } from '../types';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Create a collection for commands
const commands = new Collection<string, BotCommand>();

// Function to register commands
export async function registerCommands(clientId: string, token: string): Promise<void> {
  try {
    // Load all command files
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    const commandsData = [];
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(filePath).default as BotCommand;
      
      if (!command.data || !command.execute) {
        console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        continue;
      }
      
      commands.set(command.data.name, command);
      commandsData.push(command.data.toJSON());
    }
    
    // Register slash commands with Discord API
    const rest = new REST({ version: '10' }).setToken(token);
    
    console.log(`Started refreshing ${commands.size} application (/) commands.`);
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandsData }
    );
    
    console.log(`Successfully reloaded ${commands.size} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

// Export the commands collection
export { commands }; 