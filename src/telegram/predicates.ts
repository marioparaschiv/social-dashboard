import type { TelegramListener } from '@shared/types';
import { getDefaults } from '~/config';
import type { Api } from 'telegram';


export function globalPredicate(
	listener: TelegramListener,
	chatId: string,
	author: Api.User | Api.Channel,
	reply: Api.Message,
	replyAuthor: Api.User
) {
	const defaults = getDefaults();

	if (listener.chatId && chatId !== listener.chatId) {
		return false;
	}

	if (!(listener.allowBots ?? defaults.allowBots) && author.className === 'User' && author.bot) {
		return false;
	}

	if (listener.users && author.className !== 'User') {
		return false;
	}

	const usernames = author.usernames?.map(u => u.username) ?? (author.username ? [author.username] : []);

	if (listener.users && !usernames.some(u => listener.users.includes(u))) {
		return false;
	}

	if ((listener.blacklistedUsers ?? defaults.blacklistedUsers)?.length && usernames.some(u => listener.blacklistedUsers.includes(u))) {
		return false;
	}

	if (listener.replyingTo?.length && !reply) {
		return false;
	}

	if (listener.replyingTo?.length && replyAuthor.className !== 'User') {
		return false;
	}

	const replyAuthorUsernames = replyAuthor?.usernames?.map(u => u.username) ?? (replyAuthor?.username ? [replyAuthor.username] : []);

	if (listener.replyingTo?.length && !replyAuthorUsernames.some(u => listener.replyingTo.includes(u))) {
		return false;
	}

	return true;
}

export function chatPredicate(
	listener: TelegramListener,
	author: Api.User | Api.Channel,
	chat: Api.Chat,
	reply: Api.Message,
	replyAuthor: Api.User
) {
	if (!globalPredicate(listener, chat.id.toString(), author, reply, replyAuthor)) return false;

	return true;
}

export function channelPredicate(
	listener: TelegramListener,
	author: Api.User | Api.Channel,
	channel: Api.Channel,
	reply: Api.Message,
	replyAuthor: Api.User
) {
	if (!globalPredicate(listener, channel.id.toString(), author, reply, replyAuthor)) return false;

	// Forums
	if (listener.subchannels !== undefined) {
		const topic = reply?.action?.className == 'MessageActionTopicCreate' ? reply.action.title : null;
		const includeMainChannel = listener.includeMainSubchannel && !reply;
		const topicMatches = topic && listener.subchannels.includes(topic);

		if (topic && !topicMatches) return false;
		if (!topic && !includeMainChannel) return false;
	}

	return true;
}

export function dmPredicate(
	listener: TelegramListener,
	author: Api.User | Api.Channel,
	user: Api.User | Api.PeerUser,
	reply: Api.Message,
	replyAuthor: Api.User
) {
	const defaults = getDefaults();
	const userId = ((user as Api.User).id ?? (user as Api.PeerUser).userId).toString();

	if (!globalPredicate(listener, userId, author, reply, replyAuthor)) return false;
	if (!(listener.allowDMs ?? defaults.allowDMs)) return false;

	return true;
}