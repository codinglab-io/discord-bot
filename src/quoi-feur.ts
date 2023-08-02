import type { Message } from 'discord.js';
import { config } from './config';

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

  message.member?.roles.add(config.discord.mutedRoleId);
  setTimeout(() => {
    message.member?.roles.remove(config.discord.mutedRoleId);
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
