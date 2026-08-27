import dotenv from 'dotenv';
import os from 'os';
import crypto from 'crypto';

dotenv.config();

const machineFingerprint = crypto
	.createHash('sha256')
	.update(`${os.hostname()}|${os.platform()}|${os.arch()}`)
	.digest('hex');

const envHalf = process.env.OMNICLOUD_SECRET_HALF || 'omnicloud-dev-secret-half';
const derivedKeyMaterial = `${envHalf}:${machineFingerprint}`;
const encryptionKey = crypto.createHash('sha256').update(derivedKeyMaterial).digest();

const rawFrontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
const frontendUrl = rawFrontendUrl.replace(/\/+$/, '');

export function getRedirectUri(req, providerPath) {
	const envKey = `${providerPath.toUpperCase()}_REDIRECT_URI`;
	const envVar = process.env[envKey];

	let baseUrl = '';
	if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() && !process.env.FRONTEND_URL.includes('localhost')) {
		baseUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
	} else if (req) {
		const rawProto = (req.headers && req.headers['x-forwarded-proto']) || req.protocol || 'http';
		const proto = String(rawProto).split(',')[0].trim();
		const rawHost = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '';
		const host = String(rawHost).split(',')[0].trim();
		if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
			baseUrl = `${proto}://${host}`.replace(/\/+$/, '');
		}
	}

	if (!baseUrl) {
		baseUrl = frontendUrl;
	}

	if (envVar && envVar.trim()) {
		const val = envVar.trim();
		if (val.includes('localhost') && !baseUrl.includes('localhost')) {
			return `${baseUrl}/api/accounts/${providerPath}/callback`;
		}
		return val;
	}

	return `${baseUrl}/api/accounts/${providerPath}/callback`;
}

export const env = {
	port: Number(process.env.PORT || 8787),
	appMode: process.env.APP_MODE === 'hosted' ? 'hosted' : 'local',
	corsOrigin: process.env.CORS_ORIGIN || frontendUrl,
	syncIntervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES || 5),
	authCookieName: process.env.AUTH_COOKIE_NAME || 'omnicloud_session',
	authSessionTtlHours: Number(process.env.AUTH_SESSION_TTL_HOURS || 24 * 14),
	authSecret: process.env.AUTH_SECRET || process.env.OMNICLOUD_SECRET_HALF || 'omnicloud-dev-auth-secret',
	encryptionKey,
	frontendUrl,
	googleClientId: process.env.GOOGLE_CLIENT_ID || '',
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
	googleRedirectUri: getRedirectUri(null, 'google'),
	onedriveClientId: process.env.ONEDRIVE_CLIENT_ID || '',
	onedriveClientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
	onedriveTenantId: process.env.ONEDRIVE_TENANT_ID || 'common',
	onedriveRedirectUri: getRedirectUri(null, 'onedrive'),
	dropboxClientId: process.env.DROPBOX_CLIENT_ID || '',
	dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
	dropboxRedirectUri: getRedirectUri(null, 'dropbox'),
	yandexClientId: process.env.YANDEX_CLIENT_ID || '',
	yandexClientSecret: process.env.YANDEX_CLIENT_SECRET || '',
	yandexRedirectUri: getRedirectUri(null, 'yandex'),
};

export function redactEnv() {
	return {
		port: env.port,
		appMode: env.appMode,
		corsOrigin: env.corsOrigin,
		syncIntervalMinutes: env.syncIntervalMinutes,
		authCookieName: env.authCookieName,
		authSessionTtlHours: env.authSessionTtlHours,
		frontendUrl: env.frontendUrl,
		googleClientId: env.googleClientId ? '[configured]' : '[missing]',
		googleRedirectUri: env.googleRedirectUri,
		onedriveClientId: env.onedriveClientId ? '[configured]' : '[missing]',
		onedriveTenantId: env.onedriveTenantId,
		onedriveRedirectUri: env.onedriveRedirectUri,
		dropboxClientId: env.dropboxClientId ? '[configured]' : '[missing]',
		dropboxRedirectUri: env.dropboxRedirectUri,
		yandexClientId: env.yandexClientId ? '[configured]' : '[missing]',
		yandexRedirectUri: env.yandexRedirectUri,
	};
}
