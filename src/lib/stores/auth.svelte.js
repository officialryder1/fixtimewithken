import { pb } from "$lib/pocketbase";



let currentUser = $state(pb.authStore.model)
console.log(pb.authStore.model);


export function updateCurrentUser() {
    currentUser = pb.authStore.model;
    console.log("Updated current user:", currentUser);
}

export function getCurrentUser() {
    return currentUser;
}

export function checkAuth() {
    if (!currentUser){
        console.log("User is not authenticated");
        return false;
    }

    if(currentUser && currentUser.email) {
        console.log("User is authenticated:", currentUser.email);
        return true;
    }
}
