import { type APIInteractionGuildMember, GuildMember } from 'discord.js';

export const isAdmin = (member: GuildMember | APIInteractionGuildMember | null): boolean =>
  member instanceof GuildMember && member.roles.cache.some((role) => role.name === 'Admin');

export const isModo = (member: GuildMember | APIInteractionGuildMember | null): boolean =>
  member instanceof GuildMember &&
  member.roles.cache.some((role) => role.name === 'Admin' || role.name === 'Modo');
