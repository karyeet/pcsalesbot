import type {
  SlashCommandBuilder,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  CommandInteraction,
} from 'discord.js';

import {REST, Routes} from 'discord.js';

import path from 'path';
import fs from 'fs';

interface SlashCommand {
  data: SlashCommandBuilder;
  execute: Function;
}

export class CommandManager {
  private commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  private commands: {[key: string]: SlashCommand} = {};

  constructor(pathToCommands = '../commands') {
    void this.loadCommands(pathToCommands);
  }

  public async loadCommands(pathToCommands: string) {
    // Grab all the commands
    this.commandsJSON = [];
    this.commands = {};

    const commandsPath: string = path.join(__dirname, pathToCommands);
    const commandFiles: string[] = fs
      .readdirSync(commandsPath)
      .filter((file: string) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath: string = path.join(commandsPath, file);
      const command: SlashCommand = require(filePath);
      if ('data' in command && 'execute' in command) {
        this.commandsJSON.push(command.data.toJSON());
        this.commands[command.data.name] = command;
      } else {
        console.warn(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  public async registerCommands(clientId: string, token: string) {
    try {
      console.log(
        `Started refreshing ${this.commandsJSON.length} application (/) commands.`,
      );
      const rest = new REST().setToken(token);

      const data: any = await rest.put(Routes.applicationCommands(clientId), {
        body: this.commandsJSON,
      });

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`,
      );
      return true;
    } catch (error) {
      console.error('Error while refreshing commands:\n', error);
      return false;
    }
  }

  public async executeCommand(
    commandName: string,
    interaction: CommandInteraction,
  ) {
    if (commandName in this.commands) {
      await this.commands[commandName].execute(interaction);
    } else {
      console.warn(`Command ${commandName} was called, but not found.`);
    }
  }
}
