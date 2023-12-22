import { type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export const isDiffBetweenLocalCommandsAndRemoteCommands = (
  localCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
  remoteCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
) => {
  return localCommands.length !== remoteCommands.length ? true : false;
};
