import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import type {SalesBot} from '../classes/SalesBot';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unset_channel')
    .setDescription('Stop sending in this guild.'),
  async execute(interaction: ChatInputCommandInteraction, salesbot: SalesBot) {
    if (!interaction.guildId) {
      await interaction.reply('This command only works in servers');
      return false;
    }

    await salesbot.set_channel(interaction.guildId, '0');

    await interaction.reply({
      content: 'Unset channel.',
      ephemeral: true,
    });

    return true;
  },
};
