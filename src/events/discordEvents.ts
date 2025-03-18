import { Client, Events, Interaction } from 'discord.js';
import { commands } from '../utils/commandHandler';
import { ClientWithPlayer } from '../types';

export function registerDiscordEvents(client: ClientWithPlayer): void {
  // When the bot is ready
  client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Handle interactions (slash commands)
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Debug logging
    console.log('Received command:', interaction.commandName);
    console.log('Command options:', interaction.options.data);

    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      // Create a user-friendly error message that doesn't expose implementation details
      const errorMessage = 'There was an error while executing this command. Please try again later.';
      
      try {
        // If the reply has already been deferred, use followUp, otherwise reply
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: errorMessage,
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: errorMessage,
            ephemeral: true
          });
        }
      } catch (replyError) {
        // If we can't reply, just log the error
        console.error('Failed to send error message:', replyError);
      }
    }
  });

  // Global error handler for uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Keep the bot running
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    // Keep the bot running
  });
} 