import type { ChatInputCommandInteraction } from 'discord.js';

import { getUserAccount } from './helpers/store';

export const displayUserBank = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const commandHasUserOption = interaction.options.data.length !== 0;
  if (commandHasUserOption) {
    const user = interaction.options.getUser('user');
    if (!user) {
      await interaction.reply('User not found');
      return;
    }

    const userBankAccount = await getUserAccount(user.id);
    if (userBankAccount === undefined) {
      await interaction.reply('This user has no cookie in their bank account.');
      return;
    }
    await interaction.reply(
      `${user.username} has ${userBankAccount} cookies in their bank account.`,
    );
    return;
  }

  const currentUserAccount = await getUserAccount(interaction.user.id);
  if (currentUserAccount === undefined) {
    await interaction.reply('You have no cookie in your bank account.');
    return;
  }
  await interaction.reply(`You have ${currentUserAccount} cookies in your bank account.`);
};
