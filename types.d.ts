import type { getDiscordEntityDetails, getTelegramEntityDetails } from '~/utils/get-entity-details';
import type { DispatchType } from '@shared/constants';


declare module 'ws' {
	interface WebSocket {
		authenticated: boolean;
	}
}


export interface AuthRequest {
	password: string;
}

export interface RequestReply<T = StoreItemTypes> {
	messageType: T;
	content: string;
	uuid: string;
	parameters: T extends 'telegram' ? TelegramParameters : T extends 'discord' ? DiscordParameters : never;
}

export interface AuthResponse {
	success: boolean;
}

export interface RequestImage {
	hash: string;
}

export interface ImageResponse {
	hash: string;
	data: string;
}

export interface Dispatch {
	type: DispatchType;
	[key: PropertyKey]: any;
}

export interface SendMessageOptions {
	guild: string | null;
	channel: string;
	message: Partial<Message>;
	token: string;
	retriesRemaining?: number;
}

export interface GetMessageOptions {
	token: string;
	channel: string;
	message: string;
	retriesRemaining?: number;
}

export type DiscordReplacements = Record<string, string>;

export interface DiscordListener {
	name: string;
	group: string;
	chatId?: string;
	allowBots?: boolean;
	allowDMs?: boolean;
	replyingTo?: string[];
	blacklistedUsers?: string[];
	users?: string;
}

export interface TelegramListener {
	name: string;
	group: string;
	chatId?: string;
	users?: string[];
	allowBots?: boolean;
	allowDMs?: boolean;
	replyingTo?: string[];
	blacklistedUsers?: string[];
	includeMainSubchannel?: boolean;
	subchannels?: string[];
}

export interface StoreItemAttachment {
	name: string;
	identifier: string;
	type: string;
}

export interface DiscordParameters {
	messageId: string;
	channelId: string;
	guildId: string;
	accountIndex: number;
}

export interface TelegramParameters {
	messageId: string;
	originId: string;
	accountIndex: number;
}

export type StoreItemTypes = 'discord' | 'telegram';

export type StoreItemParameters<T extends string> = T extends 'discord' ? DiscordParameters
	: T extends 'telegram' ? TelegramParameters : (DiscordParameters & TelegramParameters);

export interface StoreItem<T extends string = StoreItemTypes, K = StoreItemParameters<T>> {
	savedAt: number;
	type: T;
	groups: string[];
	author: string;
	// author: {
	// 	name: string;
	// 	avatar: string;
	// };
	// origin: {
	// 	entity:  T extends 'telegram' ? Awaited<ReturnType<typeof getTelegramEntityDetails>> : T extends 'discord' ? Awaited<ReturnType<typeof getDiscordEntityDetails>> : never;
	// 	avatar: string;
	// };
	reply: {
		author: string;
		content: string;
		attachmentCount: number;
	} | null;
	listeners: string[];
	origin: T extends 'telegram' ? Awaited<ReturnType<typeof getTelegramEntityDetails>> : T extends 'discord' ? Awaited<ReturnType<typeof getDiscordEntityDetails>> : never;
	originAvatar: string;
	authorAvatar: string;
	content: string;
	attachments: StoreItemAttachment[];
	parameters: K;
}

export interface User {
	verified: boolean,
	username: string,
	purchased_flags: number,
	public_flags: number,
	pronouns: string,
	premium_type: number,
	premium: boolean,
	phone: string | null,
	nsfw_allowed: boolean,
	mobile: boolean,
	mfa_enabled: boolean,
	id: string,
	global_name: string,
	flags: number,
	email: string,
	discriminator: string,
	desktop: boolean,
	bio: string,
	banner_color: string | null,
	banner: string | null,
	avatar_decoration_data: string | null,
	avatar: string | null,
	accent_color: string | null;
	bot: boolean;
}

export interface Guild {
	afk_channel_id: string | null,
	public_updates_channel_id: string | null,
	explicit_content_filter: number,
	vanity_url_code: string | null,
	afk_timeout: number,
	home_header: null,
	embedded_activities: any[],
	latest_onboarding_question_id: string | null,
	id: string,
	discovery_splash: string | null,
	mfa_level: number,
	name: string,
	presences: any,
	application_command_counts: any,
	stage_instances: any[],
	system_channel_flags: number,
	soundboard_sounds: any[],
	lazy: boolean,
	premium_subscription_count: number,
	threads: any[],
	application_id: null,
	region: string,
	preferred_locale: string,
	max_members: number,
	premium_progress_bar_enabled: boolean,
	rules_channel_id: string | null,
	description: string | null,
	premium_tier: number,
	max_stage_video_channel_users: number,
	splash: null,
	incidents_data: null,
	member_count: number,
	guild_scheduled_events: any[],
	voice_states: any[],
	owner_id: string | null,
	icon: string | null,
	nsfw_level: number,
	features: any[],
	system_channel_id: string | null,
	roles: any[],
	hub_type: string | number | null,
	members: any[],
	inventory_settings: null,
	channels: any[],
	emojis: any[],
	max_video_channel_users: number,
	nsfw: boolean,
	banner: string | null,
	joined_at: string,
	large: boolean,
	stickers: any[],
	version: number,
	safety_alerts_channel_id: string | null,
	default_message_notifications: number,
	verification_level: number;
}

export interface Message {
	id: string,
	type: number,
	content: string,
	channel_id: string,
	guild_id?: string,
	author: User,
	message_reference: {
		message_id: string;
		channel_id: string;
	} | null,
	attachments: any[],
	embeds: any[],
	mentions: any[],
	mention_roles: any[],
	pinned: boolean,
	mention_everyone: boolean,
	tts: boolean,
	timestamp: string,
	edited_timestamp: string | null,
	flags: number,
	components: any[];
}

