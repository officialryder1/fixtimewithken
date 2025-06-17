import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

export function getFileUrl(collectionId, recordId, fileName){
    return `http://127.0.0.1:8090/api/files/${collectionId}/${recordId}/${fileName}`;
}
