import type { Message } from 'discord.js';

import { MUTED_BY_BOT } from './constants.ts/roles';

const quoiDetector = new RegExp(/\b\s*[qQ][uU][oO][iI]\s*[.,!?]*\s*$/i);
const ONE_MINUTE = 60000;

const reactWithFeur = async (message: Message) => {
  await message.react('🇫');
  await message.react('🇪');
  await message.react('🇺');
  await message.react('🇷');
};

const reactWithCoubeh = async (message: Message) => {
  await message.react('🇨');
  await message.react('🇴');
  await message.react('🇺');
  await message.react('🇧');
  await message.react('🇪');
  await message.react('🇭');
  await message.react('🔇');

  const mutedRole = message.guild?.roles.cache.find((r) => r.name === MUTED_BY_BOT);

  if (!mutedRole?.id) return;

  await message.member?.roles.add(mutedRole.id);

  setTimeout(() => {
    message.member?.roles.remove(mutedRole.id).catch(console.error);
  }, ONE_MINUTE * 5);
};

export const quoiFeurReact = async (message: Message) => {
  if (!quoiDetector.test(message.content)) return;

  const probability = 1 / 20;
  if (Math.random() <= probability) {
    await reactWithCoubeh(message);
  } else {
    await reactWithFeur(message);
  }
};
