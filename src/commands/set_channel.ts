import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
} from 'discord.js';
import type {SalesBot} from '../classes/SalesBot';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_channel')
    .setDescription('Set channel to notify in.')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Text channel to send posts to.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction, salesbot: SalesBot) {
    if (!interaction.guildId) {
      await interaction.reply('This command only works in servers');
      return false;
    }

    const channel: TextChannel = interaction.options.getChannel('channel')!;
    await salesbot.set_channel(interaction.guildId, channel.id);

    await interaction.reply({
      content: `Set channel to <#${channel.id}>`,
      ephemeral: true,
    });

    const permissions = channel
      .permissionsFor(interaction.client.user)!
      .toArray();
    if (
      !(
        permissions.includes('SendMessages') &&
        permissions.includes('EmbedLinks') &&
        permissions.includes('AttachFiles')
      )
    ) {
      await interaction.followUp({
        content: `Permissions missing in <#${channel.id}>. Please make sure I have the following permissions: Send Messages, Embed Links, Attach Files`,
        ephemeral: true,
      });
    }

    return true;
  },
};
