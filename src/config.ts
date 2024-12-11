import type { DiscordListener, DiscordReplacements, TelegramListener } from '@types';
import config from '@config.json';


export function getDiscordListeners(): DiscordListener[] {
	return config.discord?.listeners ?? [];
}

export function getDiscordReplacements(): DiscordReplacements {
	return config.discord?.replacements ?? {};
}

export function getTelegramListeners(): TelegramListener[] {
	return config.telegram?.listeners ?? [];
}