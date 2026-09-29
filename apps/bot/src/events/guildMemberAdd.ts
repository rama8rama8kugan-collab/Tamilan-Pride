import { Client, Events, GuildMember } from 'discord.js';
import { WelcomeService } from '../services/WelcomeService';
import { logger } from '../utils/logger';

const welcomeService = new WelcomeService();

export function registerGuildMemberAdd(client: Client) {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      await welcomeService.sendWelcome(member);
    } catch (error) {
      logger.error(`Failed to process guildMemberAdd for ${member.guild.id}`, error);
    }
  });
}
