import { useEffect, useState } from 'react';
import moment from 'moment';


interface TimestampProps extends React.ComponentProps<'span'> {
	timestamp: number;
}

function Timestamp({ timestamp, ...props }: TimestampProps) {
	const [formattedTime, setFormattedTime] = useState('');

	useEffect(() => {
		// Initial format
		setFormattedTime(formatDiscordTimestamp(timestamp));

		// Set up an interval to update the timestamp
		const intervalId = setInterval(() => {
			setFormattedTime(formatDiscordTimestamp(timestamp));
		}, 60000); // Update every minute

		// Cleanup on unmount
		return () => clearInterval(intervalId);
	}, [timestamp]);

	return <span {...props}>{formattedTime}</span>;
}

function formatDiscordTimestamp(time: number) {
	const now = moment();
	const timeObj = moment(time);

	// Today - use relative time if less than 24 hours
	if (now.diff(timeObj, 'hours') < 24 && now.isSame(timeObj, 'day')) {
		// Today but more than an hour ago
		return `[${timeObj.format('HH:mm A')}]`;
	}

	// Within the last 7 days
	if (now.diff(timeObj, 'days') < 7) {
		return timeObj.format('[\[]dddd [at] HH:mm[\]]');
	}

	// Within the current year
	if (now.isSame(timeObj, 'year')) {
		return timeObj.format('[\[]MMM D [at] HH:mm[\]]');
	}

	// Different year
	return timeObj.format('[\[]MM/DD/YYYY[\]]');
};

export default Timestamp;