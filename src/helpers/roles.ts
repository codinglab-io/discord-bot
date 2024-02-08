import {
  type APIInteractionGuildMember,
  GuildMember,
  ChannelType,
  type User,
  type Channel,
} from 'discord.js';

export const isAdmin = (member: GuildMember | APIInteractionGuildMember | null): boolean =>
  member instanceof GuildMember && member.roles.cache.some((role) => role.name === 'Admin');

export const isModo = (member: GuildMember | APIInteractionGuildMember | null): boolean =>
  member instanceof GuildMember &&
  member.roles.cache.some((role) => role.name === 'Admin' || role.name === 'Modo');

export const isThreadOwner = (channel: Channel, user: User) =>
  channel.type === ChannelType.PublicThread && user.id === channel.ownerId;
