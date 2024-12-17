import type { NewMessageEvent } from 'telegram/events';
import type { TelegramListener } from '@types';
import type { Api } from 'telegram';


export function globalPredicate(listener: TelegramListener, chatId: string, author: Api.User) {
	if (listener.chatId && chatId !== listener.chatId) return false;
	if (listener.users && !(author.usernames ?? []).some(u => listener.users.includes(u.username))) return false;

	return true;
}

export function chatPredicate(listener: TelegramListener, event: NewMessageEvent, author: Api.User, chat: Api.Chat) {
	if (!globalPredicate(listener, chat.id.toString(), author)) return false;

	return true;
}

export function channelPredicate(listener: TelegramListener, event: NewMessageEvent, author: Api.User, channel: Api.Channel, reference: Api.Message) {
	if (!globalPredicate(listener, channel.id.toString(), author)) return false;

	// Forums
	if (listener.subchannels !== undefined) {
		const topic = reference?.action.className == 'MessageActionTopicCreate' ? reference.action.title : null;
		const includeMainChannel = listener.includeMainSubchannel && !reference;
		const topicMatches = topic && listener.subchannels.includes(topic);

		if (topic && !topicMatches) return false;
		if (!topic && !includeMainChannel) return false;
	}

	return true;
}

export async function dmPredicate(listener: TelegramListener, event: NewMessageEvent, author: Api.User, user: Api.PeerUser) {
	if (!globalPredicate(listener, user.userId.toString(), author)) return false;

	return true;
}