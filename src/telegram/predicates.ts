import type { NewMessageEvent } from 'telegram/events';
import type { TelegramListener } from '@types';
import type { Api } from 'telegram';


export function chatPredicate(listener: TelegramListener, event: NewMessageEvent, author: Api.User, chat: Api.Chat) {
	if (listener.chatId && chat.id.toString() !== listener.chatId) return false;
	if (listener.users && !(author.usernames ?? []).some(u => listener.users.includes(u.username))) return false;

	return true;
}

export function channelPredicate(listener: TelegramListener, event: NewMessageEvent, author: Api.User, channel: Api.Channel, reference: Api.Message) {
	if (listener.chatId && channel.id.toString() !== listener.chatId) return false;
	if (listener.users && !(author.usernames ?? []).some(u => listener.users.includes(u.username))) return false;

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
	if (listener.chatId && user.userId.toString() !== listener.chatId) return false;
	if (listener.users && !(author.usernames ?? []).some(u => listener.users.includes(u.username))) return false;

	return true;
}