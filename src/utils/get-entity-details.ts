import type { Guild, Message } from '@types';
import { Api } from 'telegram';


export async function getTelegramEntityDetails(peer: any, reference?: Api.Message) {
	try {
		// If we received a Peer object, get the full entity
		let entity = peer;

		// Handle different peer types
		if (peer instanceof Api.PeerUser) {
			entity = await this.getEntity(peer.userId);
		} else if (peer instanceof Api.PeerChannel) {
			entity = await this.getEntity(peer.channelId);
		} else if (peer instanceof Api.PeerChat) {
			entity = await this.getEntity(peer.chatId);
		}

		// For users (including DM channels)
		if (entity instanceof Api.User) {
			const firstName = entity.firstName || '';
			const lastName = entity.lastName || '';
			const fullName = `${firstName} ${lastName}`.trim();

			return {
				fullName,
				username: entity.username || null,
				phone: entity.phone || null,
				type: 'user',
				id: entity.id.toString(),
				isBot: entity.bot || false,
				isPremium: entity.premium || false
			};
		}

		// For chats (basic groups)
		if (entity instanceof Api.Chat) {
			return {
				title: entity.title,
				type: 'chat',
				id: entity.id.toString(),
				membersCount: entity.participantsCount,
				deactivated: entity.deactivated || false
			};
		}

		// For channels (supergroups and channels)
		if (entity instanceof Api.Channel) {
			const forumName = reference?.action?.className == 'MessageActionTopicCreate' ? reference.action.title : null;

			return {
				title: entity.title,
				username: entity.username || null,
				forum: entity.forum,
				forumName,
				type: entity.megagroup ? 'supergroup' : 'channel',
				id: entity.id.toString(),
				participantsCount: entity.participantsCount,
				verified: entity.verified || false,
				broadcast: entity.broadcast || false
			};
		}

		// Handle any other entity with a title
		if (entity.title) {
			return {
				title: entity.title,
				type: 'unknown',
				id: entity.id?.toString() || null
			};
		}

		return null;
	} catch (error) {
		console.error('Error getting entity name:', error);
		return null;
	}
}

export async function getDiscordEntityDetails(message: Message, guild: Guild, channel) {
	if (!channel) return null;

	try {
		// Handle DM/Group DM channel
		if (!message.guild_id) {

			// Regular DM
			if (channel.type === 1) {
				const recipient = channel.recipients?.[0];
				if (!recipient) return null;

				return {
					type: 'dm',
					id: channel.id,
					username: recipient.username,
					isBot: recipient.bot || false
				};
			}

			// Group DM
			if (channel.type === 3) {
				return {
					type: 'group',
					id: channel.id,
					title: channel.name,
					recipients: channel.recipients?.map(r => ({
						username: r.username,
						id: r.id,
						isBot: r.bot || false
					}))
				};
			}
		}

		if (!guild) return null;

		return {
			type: 'guild',
			id: guild.id,
			name: guild.name,
			channelId: channel.id,
			channelName: channel.name,
			membersCount: guild.member_count
		};
	} catch (error) {
		console.error('Error getting entity details:', error);
		return null;
	}
}