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

function resolveRedirectUri(envVar, providerPath) {
	if (envVar && envVar.trim()) {
		const val = envVar.trim();
		if (val.includes('localhost') && !frontendUrl.includes('localhost')) {
			return `${frontendUrl}/api/accounts/${providerPath}/callback`;
		}
		return val;
	}
	return `${frontendUrl}/api/accounts/${providerPath}/callback`;
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
	googleRedirectUri: resolveRedirectUri(process.env.GOOGLE_REDIRECT_URI, 'google'),
	onedriveClientId: process.env.ONEDRIVE_CLIENT_ID || '',
	onedriveClientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
	onedriveTenantId: process.env.ONEDRIVE_TENANT_ID || 'common',
	onedriveRedirectUri: resolveRedirectUri(process.env.ONEDRIVE_REDIRECT_URI, 'onedrive'),
	dropboxClientId: process.env.DROPBOX_CLIENT_ID || '',
	dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
	dropboxRedirectUri: resolveRedirectUri(process.env.DROPBOX_REDIRECT_URI, 'dropbox'),
	yandexClientId: process.env.YANDEX_CLIENT_ID || '',
	yandexClientSecret: process.env.YANDEX_CLIENT_SECRET || '',
	yandexRedirectUri: resolveRedirectUri(process.env.YANDEX_REDIRECT_URI, 'yandex'),
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
