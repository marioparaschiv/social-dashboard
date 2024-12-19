import crypto from 'node:crypto';


type HashAlgorithm = 'md5'
	| 'sha1'
	| 'sha224'
	| 'sha256'
	| 'sha384'
	| 'sha512'
	| 'blake2b512'
	| 'blake2s256'
	| 'sha3-224'
	| 'sha3-256'
	| 'sha3-384'
	| 'sha3-512';

interface HashOptions {
	algorithm?: HashAlgorithm;
}

function hash(input: ArrayBuffer, options: HashOptions = {}) {
	const { algorithm = 'sha256' } = options;

	// Create hash
	const hash = crypto
		.createHash(algorithm)
		.update(new Uint8Array(input))
		.digest('hex');

	// Optionally truncate
	return hash;
}

export default hash;