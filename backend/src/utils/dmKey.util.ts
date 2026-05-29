export const buildDmKey = (userId : string , otherUserId : string) => {
    return [userId , otherUserId].sort().join(":")
}