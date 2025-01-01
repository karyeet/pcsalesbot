import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import type {SalesBot} from '../classes/SalesBot';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban_term')
    .setDescription(
      "Don't notify you if this term is in the title. Prioritized over tracked terms. Not case sensitive",
    )
    .addStringOption(option =>
      option
        .setName('term')
        .setDescription('Term to ban')
        .setRequired(true)
        .setMaxLength(30),
    ),
  async execute(interaction: ChatInputCommandInteraction, salesbot: SalesBot) {
    if (!interaction.guildId) {
      await interaction.reply('This command only works in servers');
      return false;
    }

    const term: string = interaction.options.getString('term')!.toLowerCase();
    await salesbot.add_banned_term(
      interaction.guildId,
      interaction.user.id,
      term,
    );
    await interaction.reply({
      content: `Added term \`${term}\` to your banned terms`,
      ephemeral: true,
    });

    return true;
  },
};
