import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import type {SalesBot} from '../classes/SalesBot';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_term')
    .setDescription(
      'Notify you when this term is found in a post. Not case sensitive',
    )
    .addStringOption(option =>
      option
        .setName('term')
        .setDescription('Term to notify you about')
        .setRequired(true)
        .setMaxLength(30),
    ),
  async execute(interaction: ChatInputCommandInteraction, salesbot: SalesBot) {
    if (!interaction.guildId) {
      await interaction.reply('This command only works in servers');
      return false;
    }

    const term = interaction.options.getString('term')!.toLowerCase();
    await salesbot.add_tracked_term(
      interaction.guildId,
      interaction.user.id,
      term,
    );
    await interaction.reply({
      content: `Added term \`${term}\` to your tracked terms`,
      ephemeral: true,
    });

    return true;
  },
};
