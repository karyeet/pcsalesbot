import {Client, Events, GatewayIntentBits} from 'discord.js';
import {token} from '../config.json';
import {CommandManager} from './classes/CommandManager';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const commandManager = new CommandManager();

client.once(Events.ClientReady, readyClient => {
  console.log(`Discord Ready! Logged in as ${readyClient.user.tag}`);
  void commandManager.registerCommands(readyClient.user.id, token);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await commandManager.executeCommand(interaction.commandName, interaction);
  } catch (error) {
    console.error(
      'Error occured while executing command',
      interaction.commandName,
      error,
    );
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    } catch (error2) {
      console.error('Error occured while responding with error!?', error2);
    }
  }
});

// Log in to Discord with your client's token
void client.login(token);
