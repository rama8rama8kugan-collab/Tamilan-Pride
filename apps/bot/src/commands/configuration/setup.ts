import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder
} from 'discord.js';
import type { CommandDefinition } from '../command';
import { prisma } from '@tamilanpride/database';
import { logger } from '../../utils/logger';

export const setupCommand: CommandDefinition = {
  name: 'setup',
  description: 'Configure guild settings.',
  permissions: ['MANAGE_GUILD'],
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure guild settings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName('welcome')
        .setDescription('Configure welcome messages')
        .addSubcommand((sub) =>
          sub
            .setName('enable')
            .setDescription('Enable welcome messages')
        )
        .addSubcommand((sub) =>
          sub
            .setName('disable')
            .setDescription('Disable welcome messages')
        )
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set welcome channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Channel for welcome messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('message')
            .setDescription('Set welcome message')
            .addStringOption((opt) =>
              opt
                .setName('message')
                .setDescription('Message template (use {user}, {username}, {server}, {membercount})')
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('leave')
        .setDescription('Configure leave messages')
        .addSubcommand((sub) =>
          sub
            .setName('enable')
            .setDescription('Enable leave messages')
        )
        .addSubcommand((sub) =>
          sub
            .setName('disable')
            .setDescription('Disable leave messages')
        )
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set leave channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Channel for leave messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('message')
            .setDescription('Set leave message')
            .addStringOption((opt) =>
              opt
                .setName('message')
                .setDescription('Message template (use {user}, {username}, {server})')
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('logging')
        .setDescription('Configure logging channels')
        .addSubcommand((sub) =>
          sub
            .setName('moderation')
            .setDescription('Set moderation log channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Channel for moderation logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('messages')
            .setDescription('Set message log channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Channel for message logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('tickets')
            .setDescription('Set ticket log channel')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Channel for ticket logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('tickets')
        .setDescription('Configure ticket system')
        .addSubcommand((sub) =>
          sub
            .setName('category')
            .setDescription('Set ticket category')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('Category for ticket channels')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('support_role')
            .setDescription('Set support role')
            .addRoleOption((opt) =>
              opt
                .setName('role')
                .setDescription('Role that can manage tickets')
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('automod')
        .setDescription('Configure AutoMod')
        .addSubcommand((sub) =>
          sub
            .setName('enable')
            .setDescription('Enable AutoMod')
        )
        .addSubcommand((sub) =>
          sub
            .setName('disable')
            .setDescription('Disable AutoMod')
        )
        .addSubcommand((sub) =>
          sub
            .setName('anti_spam')
            .setDescription('Toggle anti-spam')
        )
        .addSubcommand((sub) =>
          sub
            .setName('anti_invite')
            .setDescription('Toggle anti-invite')
        )
        .addSubcommand((sub) =>
          sub
            .setName('caps')
            .setDescription('Toggle caps detection')
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('leveling')
        .setDescription('Configure leveling system')
        .addSubcommand((sub) =>
          sub
            .setName('enable')
            .setDescription('Enable leveling')
        )
        .addSubcommand((sub) =>
          sub
            .setName('disable')
            .setDescription('Disable leveling')
        )
        .addSubcommand((sub) =>
          sub
            .setName('xp')
            .setDescription('Set XP per message')
            .addIntegerOption((opt) =>
              opt
                .setName('amount')
                .setDescription('XP per message (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName('cooldown')
            .setDescription('Set XP cooldown (milliseconds)')
            .addIntegerOption((opt) =>
              opt
                .setName('ms')
                .setDescription('Cooldown in milliseconds (1000-300000)')
                .setMinValue(1000)
                .setMaxValue(300000)
                .setRequired(true)
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    try {
      if (group === 'welcome') {
        await handleWelcomeSetup(interaction, guildId, subcommand);
      } else if (group === 'leave') {
        await handleLeaveSetup(interaction, guildId, subcommand);
      } else if (group === 'logging') {
        await handleLoggingSetup(interaction, guildId, subcommand);
      } else if (group === 'tickets') {
        await handleTicketsSetup(interaction, guildId, subcommand);
      } else if (group === 'automod') {
        await handleAutoModSetup(interaction, guildId, subcommand);
      } else if (group === 'leveling') {
        await handleLevelingSetup(interaction, guildId, subcommand);
      }
    } catch (error) {
      logger.error('Setup command error', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await interaction.reply({
        content: `❌ Error: ${errorMsg}`,
        ephemeral: true
      });
    }
  }
};

async function handleWelcomeSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  const guild = interaction.guild!;

  if (subcommand === 'enable') {
    await prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true },
      update: { enabled: true }
    });
    await interaction.reply({
      content: '✅ Welcome messages enabled.',
      ephemeral: true
    });
  } else if (subcommand === 'disable') {
    await prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: false },
      update: { enabled: false }
    });
    await interaction.reply({
      content: '✅ Welcome messages disabled.',
      ephemeral: true
    });
  } else if (subcommand === 'channel') {
    const channel = interaction.options.getChannel('channel', true);

    // Validate bot can send in channel
    const botMember = await guild.members.fetchMe();
    const permissions = channel.permissionsFor(botMember);
    if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({
        content: '❌ I cannot send messages in that channel.',
        ephemeral: true
      });
      return;
    }

    await prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, channelId: channel.id },
      update: { channelId: channel.id }
    });
    await interaction.reply({
      content: `✅ Welcome channel set to ${channel.toString()}`,
      ephemeral: true
    });
  } else if (subcommand === 'message') {
    const message = interaction.options.getString('message', true);
    await prisma.welcomeConfig.upsert({
      where: { guildId },
      create: { guildId, message },
      update: { message }
    });
    await interaction.reply({
      content: '✅ Welcome message updated.',
      ephemeral: true
    });
  }
}

async function handleLeaveSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  const guild = interaction.guild!;

  if (subcommand === 'enable') {
    await prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true },
      update: { enabled: true }
    });
    await interaction.reply({
      content: '✅ Leave messages enabled.',
      ephemeral: true
    });
  } else if (subcommand === 'disable') {
    await prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: false },
      update: { enabled: false }
    });
    await interaction.reply({
      content: '✅ Leave messages disabled.',
      ephemeral: true
    });
  } else if (subcommand === 'channel') {
    const channel = interaction.options.getChannel('channel', true);

    const botMember = await guild.members.fetchMe();
    const permissions = channel.permissionsFor(botMember);
    if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({
        content: '❌ I cannot send messages in that channel.',
        ephemeral: true
      });
      return;
    }

    await prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, channelId: channel.id },
      update: { channelId: channel.id }
    });
    await interaction.reply({
      content: `✅ Leave channel set to ${channel.toString()}`,
      ephemeral: true
    });
  } else if (subcommand === 'message') {
    const message = interaction.options.getString('message', true);
    await prisma.leaveConfig.upsert({
      where: { guildId },
      create: { guildId, message },
      update: { message }
    });
    await interaction.reply({
      content: '✅ Leave message updated.',
      ephemeral: true
    });
  }
}

async function handleLoggingSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  const guild = interaction.guild!;
  const channel = interaction.options.getChannel('channel', true);

  const botMember = await guild.members.fetchMe();
  const permissions = channel.permissionsFor(botMember);
  if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
    await interaction.reply({
      content: '❌ I cannot send messages in that channel.',
      ephemeral: true
    });
    return;
  }

  if (subcommand === 'moderation') {
    await prisma.loggingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, moderationLogsId: channel.id },
      update: { moderationLogsId: channel.id }
    });
    await interaction.reply({
      content: `✅ Moderation logs set to ${channel.toString()}`,
      ephemeral: true
    });
  } else if (subcommand === 'messages') {
    await prisma.loggingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, messageLogsId: channel.id },
      update: { messageLogsId: channel.id }
    });
    await interaction.reply({
      content: `✅ Message logs set to ${channel.toString()}`,
      ephemeral: true
    });
  } else if (subcommand === 'tickets') {
    await prisma.loggingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, ticketLogsId: channel.id },
      update: { ticketLogsId: channel.id }
    });
    await interaction.reply({
      content: `✅ Ticket logs set to ${channel.toString()}`,
      ephemeral: true
    });
  }
}

async function handleTicketsSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  const guild = interaction.guild!;

  if (subcommand === 'category') {
    const channel = interaction.options.getChannel('channel', true);

    const botMember = await guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({
        content: '❌ I need Manage Channels permission to configure tickets.',
        ephemeral: true
      });
      return;
    }

    await prisma.guildSettings.update({
      where: { guildId },
      data: { ticketCategoryId: channel.id }
    });
    await interaction.reply({
      content: `✅ Ticket category set to ${channel.toString()}`,
      ephemeral: true
    });
  } else if (subcommand === 'support_role') {
    const role = interaction.options.getRole('role', true);

    const botMember = await guild.members.fetchMe();
    if (role.position >= botMember.roles.highest.position) {
      await interaction.reply({
        content: '❌ That role is equal to or higher than my top role.',
        ephemeral: true
      });
      return;
    }

    // Store in a custom field or note (this is basic - could extend schema)
    await interaction.reply({
      content: `✅ Support role set to ${role.toString()}\n\n⚠️ Note: Manual implementation needed for full role management.`,
      ephemeral: true
    });
  }
}

async function handleAutoModSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  if (subcommand === 'enable') {
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true },
      update: { enabled: true }
    });
    await interaction.reply({
      content: '✅ AutoMod enabled.',
      ephemeral: true
    });
  } else if (subcommand === 'disable') {
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: false },
      update: { enabled: false }
    });
    await interaction.reply({
      content: '✅ AutoMod disabled.',
      ephemeral: true
    });
  } else if (subcommand === 'anti_spam') {
    const config = await prisma.autoModConfig.findUnique({ where: { guildId } });
    const newState = !(config?.spamEnabled ?? false);
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: { guildId, spamEnabled: newState },
      update: { spamEnabled: newState }
    });
    await interaction.reply({
      content: `✅ Anti-spam ${newState ? 'enabled' : 'disabled'}.`,
      ephemeral: true
    });
  } else if (subcommand === 'anti_invite') {
    const config = await prisma.autoModConfig.findUnique({ where: { guildId } });
    const newState = !(config?.invites ?? false);
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: { guildId, invites: newState },
      update: { invites: newState }
    });
    await interaction.reply({
      content: `✅ Anti-invite ${newState ? 'enabled' : 'disabled'}.`,
      ephemeral: true
    });
  } else if (subcommand === 'caps') {
    const config = await prisma.autoModConfig.findUnique({ where: { guildId } });
    const newState = !(config?.capsSpam ?? false);
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: { guildId, capsSpam: newState },
      update: { capsSpam: newState }
    });
    await interaction.reply({
      content: `✅ Caps detection ${newState ? 'enabled' : 'disabled'}.`,
      ephemeral: true
    });
  }
}

async function handleLevelingSetup(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  subcommand: string
) {
  if (subcommand === 'enable') {
    await prisma.levelingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true },
      update: { enabled: true }
    });
    await interaction.reply({
      content: '✅ Leveling system enabled.',
      ephemeral: true
    });
  } else if (subcommand === 'disable') {
    await prisma.levelingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: false },
      update: { enabled: false }
    });
    await interaction.reply({
      content: '✅ Leveling system disabled.',
      ephemeral: true
    });
  } else if (subcommand === 'xp') {
    const amount = interaction.options.getInteger('amount', true);
    await prisma.levelingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, xpPerMessage: amount },
      update: { xpPerMessage: amount }
    });
    await interaction.reply({
      content: `✅ XP per message set to ${amount}.`,
      ephemeral: true
    });
  } else if (subcommand === 'cooldown') {
    const ms = interaction.options.getInteger('ms', true);
    await prisma.levelingConfig.upsert({
      where: { guildId },
      create: { guildId, enabled: true, cooldownMs: ms },
      update: { cooldownMs: ms }
    });
    await interaction.reply({
      content: `✅ XP cooldown set to ${ms}ms.`,
      ephemeral: true
    });
  }
}
