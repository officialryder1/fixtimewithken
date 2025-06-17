import { pb } from '$lib/pocketbase';

export async function handle({ event, resolve }) {
    
    // Get the Cookie
    const cookie = event.request.headers.get('pb_auth');

    if(cookie) {
        try {
            pb.authStore.loadFromCookie(cookie);
            if (pb.authStore.isValid) {
                await pb.collection('users').authRefresh();
                event.locals.user = pb.authStore.model;
            }
        } catch (e) {
            pb.authStore.clear();
            event.locals.user = null;
            console.error('Error loading auth from cookie:', e);
        }
    } else {
        pb.authStore.clear();
        event.locals.user = null;
    }

    

    
    
    // sync updated auth state back to cookie
    event.cookies.set('pb_auth', pb.authStore.exportToCookie(), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
    })
    const response = await resolve(event);
    
    return response;
}