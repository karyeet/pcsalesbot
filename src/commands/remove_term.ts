import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import type {SalesBot} from '../classes/SalesBot';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove_term')
    .setDescription(
      'Stop notifying you when this term is mentioned. Not case sensitive',
    )
    .addStringOption(option =>
      option
        .setName('term')
        .setDescription('Term to stop notifying you about')
        .setRequired(true)
        .setMaxLength(30),
    ),
  async execute(interaction: ChatInputCommandInteraction, salesbot: SalesBot) {
    if (!interaction.guildId) {
      await interaction.reply('This command only works in servers');
      return false;
    }

    const term: string = interaction.options.getString('term')!.toLowerCase();
    const removed: boolean = await salesbot.remove_tracked_term(
      interaction.guildId,
      interaction.user.id,
      term,
    );
    if (removed === false) {
      await interaction.reply({
        content: `\`${term}\` is not in your tracked terms`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Removed term \`${term}\` from your tracked terms`,
        ephemeral: true,
      });
    }

    return true;
  },
};
