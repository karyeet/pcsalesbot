import {Client, Events, GatewayIntentBits} from 'discord.js';
import {token, dbpath} from '../config.json';
import {CommandManager} from './classes/CommandManager';
import {SalesBot} from './classes/SalesBot';
import {sqlite} from './classes/sqlite';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const commandManager = new CommandManager();

const storage_driver = new sqlite(dbpath);

const salesbot = new SalesBot(storage_driver);

client.once(Events.ClientReady, readyClient => {
  console.log(`Discord Ready! Logged in as ${readyClient.user.tag}`);
  void commandManager.registerCommands(readyClient.user.id, token);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await commandManager.executeCommand(
      interaction.commandName,
      interaction,
      salesbot,
    );
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

//Log in to Discord with your client's token
void client.login(token);

// import {Reddit} from './classes/Reddit';

// const reddit = new Reddit(['buildapcsales']);
// const bapc = reddit.subreddits.get('buildapcsales');

// if (bapc) {
//   bapc.posts = bapc.parse_posts_res(require('../req-example.json'));

//   void bapc.update_posts().then(() => {
//     bapc.update_flairs();
//     console.log(bapc.new_posts);
//     console.log(bapc.posts.length);
//     console.log(bapc.flairs);
//   });
// }
