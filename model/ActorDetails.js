'use strict'

function ActorDetails(actorDetails, actorCredits){
    this.biography = actorDetails.biography
    this.name = actorDetails.name
    this.birthday = actorDetails.birthday
    this.placeOfBirth = actorDetails.place_of_birth
    this.profileImage = actorDetails.profile_path
    this.cast = actorCredits.cast
}

module.exports = ActorDetails