// Importacion de dependencias y otras cosas 
const FollowModel = require('../models/follow.model');

exports.followUserIds = async (identityUserId) => {
    try {
        let following = await FollowModel.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })

        let followers = await FollowModel.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 });


        let followingClean = [];

        following.forEach((follow) => {
            followingClean.push(follow.followed);
        })

        let followersClean = [];

        followers.forEach((follow) => {
            followersClean.push(follow.user);
        })

        return {
            following: followingClean,
            followers: followersClean
        }
    }
    catch (err) {
        return {
            error: "Ocurrió un error al obtener los usuarios seguidos"
        };
    }
}


exports.followThisUser = async (identityUserId, profileUserId) => {
    
    let following = await FollowModel.findOne({ "user": identityUserId, "followed": profileUserId })

    let follower = await FollowModel.findOne({ "user": profileUserId, "followed": identityUserId })

    return {
        following: following,
        follower: follower
    }
}