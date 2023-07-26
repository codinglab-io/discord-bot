import type { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

import { getUserAccount, setUserAccount } from '../helpers/store';

export const handleGuildMessageReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  if (user.bot || !reaction.message.author || reaction.message.author.bot) {
    return;
  }

  if (reaction.emoji.name === '🍪') {
    const currentBank = await getUserAccount(reaction.message.author.id);

    if (currentBank === undefined) {
      await setUserAccount(reaction.message.author.id, 1);
      return;
    }

    await setUserAccount(reaction.message.author.id, currentBank + 1);
  }
};
