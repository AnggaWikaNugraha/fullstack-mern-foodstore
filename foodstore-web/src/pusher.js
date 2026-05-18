import Pusher from 'pusher-js';
import { config } from './config';

let pusherInstance = null;

export function getPusher(token) {
    if (pusherInstance) return pusherInstance;

    pusherInstance = new Pusher(config.pusher_key, {
        cluster: config.pusher_cluster,
        authEndpoint: `${config.api_host}/api/pusher/auth`,
        auth: {
            headers: { authorization: `Bearer ${token}` },
        },
    });

    return pusherInstance;
}

export function disconnectPusher() {
    if (pusherInstance) {
        pusherInstance.disconnect();
        pusherInstance = null;
    }
}
