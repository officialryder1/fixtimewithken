import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export function getFileUrl(collectionId, recordId, fileName){
    return `http://127.0.0.1:8090/api/files/${collectionId}/${recordId}/${fileName}`;
}
