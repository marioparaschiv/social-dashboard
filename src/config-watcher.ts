import { EventEmitter } from 'events';
import { resolve } from 'path';
import { watch } from 'fs';


class ConfigWatcher extends EventEmitter {
	configPath: string;
	webConfigPath: string;
	debounceTimeout: NodeJS.Timer | null = null;

	constructor() {
		super();
		this.configPath = resolve(__dirname, '../config.json');
		this.webConfigPath = resolve(__dirname, '../web-config.json');
		this.initWatchers();
	}

	initWatchers() {
		// Watch main config
		watch(this.configPath, (eventType) => {
			if (eventType === 'change') {
				this.handleConfigChange('config');
			}
		});

		// Watch web config
		watch(this.webConfigPath, (eventType) => {
			if (eventType === 'change') {
				this.handleConfigChange('web-config');
			}
		});
	}

	handleConfigChange(configType: 'config' | 'web-config') {
		// Debounce the reload event to prevent multiple rapid reloads
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}

		this.debounceTimeout = setTimeout(() => {
			// Clear require cache for the config files
			delete require.cache[this.configPath];
			delete require.cache[this.webConfigPath];

			// Emit reload event
			this.emit('configReload', configType);
		}, 100);
	}
}

export default new ConfigWatcher();