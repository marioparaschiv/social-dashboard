import type { Defaults, DiscordListener, DiscordReplacements, TelegramListener } from '@types';
import configWatcher from '~/config-watcher';
import { logger } from '~/index';
import storage from '~/storage';


// Load config dynamically to support hot reloading
function loadConfig() {
	return require('@config.json');
}

let config = loadConfig();

// Update config when changes are detected
configWatcher.on('configReload', (configType) => {
	if (configType === 'config') {
		config = loadConfig();
		storage.storage = {};
		storage.emit('updated');
		logger.debug('Configuration reloaded.');
	}
});

export function getDefaults(): Defaults {
	return config.defaults ?? {
		allowBots: false,
		allowDMs: true,
		blacklistedUsers: []
	};
}

export function getDiscordListeners(): DiscordListener[] {
	return config.discord?.listeners ?? [];
}

export function getDiscordReplacements(): DiscordReplacements {
	return config.discord?.replacements ?? {};
}

export function getTelegramListeners(): TelegramListener[] {
	return config.telegram?.listeners ?? [];
}