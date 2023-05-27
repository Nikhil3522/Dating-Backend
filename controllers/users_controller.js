const user_credentials = require('../models/user_credentials');
const user_details = require('../models/user_details');
const maleList = require('../models/male_list');
const femaleList = require('../models/female_list');
const bcrypt = require('bcryptjs');

module.exports.createUser = async function(req, res){
    const input = req.body;
    let encryptPassword = await bcrypt.hash(input.password, 10);
    var totalUsers = await user_credentials.find().sort({userId: -1}).limit(1);

    const newUserId = totalUsers[0].userId + 1;
    try {
        await user_credentials.create({
          userId: newUserId,
          name: input.name,
          email: input.email,
          password: encryptPassword,
          phone: input.phone,
          avatar: input.avatar,
        });
      
        return res.status(200).json({
          message: 'New user created'
        });
      } catch (error) {
        return res.status(401).json({
          message: `Error in creating a user -> ${error.message}`
        });
      }
}

module.exports.userDetails = async function(req, res){
    const input = req.body;

    const newUserId = await user_credentials.findOne({
        $or: [
          { phone: input.phone },
          { email: input.email }
        ]
    }, { userId: 1 });

    await user_credentials.updateOne({
      $or: [
        { phone: input.phone },
        { email: input.email }
      ]
    }, { $set: { avatar: input.avatar}})
    try {
        await user_details.create({
          userId: newUserId.userId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          avatar: input.avatar,
          age: input.age,
          my_basic: input.my_basic,
          image: input.image,
          college: input.college,
          relationship_goals: input.relationship_goals,
          languages: input.languages,
          gender: input.gender,
          interest: input.interest,
          recommendationPreferences: input.recommendationPreferences,
          city: input.city,
          verified: input.verified,
          location :{
              long: input.location.long,
              lat: input.location.lat
          },
          permission: input.permission
        });

        if (input.gender === "M") {
            try {
              const maleListData = await maleList.findOne();
              if (!maleListData) {
                const temp = [newUserId.userId];
                await maleList.create({
                  maleList: temp
                });
              }else{
                await maleList.updateOne({
                    $addToSet: {maleList: newUserId.userId }
                });
              }

            } catch (error) {
              console.error('Error pushing userId to maleList:', error);
            }
        }else{
            try {
                const femaleListData = await femaleList.findOne();
                if (!femaleListData) {
                  const temp = [newUserId.userId];
                  await femaleList.create({
                    femaleList: temp
                  });
                }else{
                  await femaleList.updateOne({
                      $addToSet: {femaleList: newUserId.userId }
                  });
                }
  
              } catch (error) {
                console.error('Error pushing userId to femaleList:', error);
              }
        }
      
        return res.status(200).json({
          message: 'User Details Saved!'
        });
      } catch (error) {
        return res.status(401).json({
          message: `Error in Saving a user details! -> ${error.message}`
        });
      }
}

module.exports.loginUser = async function(req, res){
  return res.json({
    message: "User LoggedIN!"
  })
}

module.exports.wrongCredential = async function(req, res){
  return res.json({
    message: "Wrong Email or Passwod!"
  })
}

const potentialProfileAlgorith = async (req, res) => {
  const userId = req.user.userId;

  const userDetails = await user_details.findOne({userId: userId});

  var userProfileId;

  if(userDetails.gender === 'M'){
    userProfileId = await femaleList.findOne();
    const shuffledArray = userProfileId.femaleList.sort(() => 0.5 - Math.random());
    userProfileId = shuffledArray.slice(0, 20);
  }else{
    userProfileId = await maleList.findOne();
    const shuffledArray = userProfileId.maleList.sort(() => 0.5 - Math.random());
    userProfileId = shuffledArray.slice(0, 20);
  }

  var users = await user_details.find({ userId : { $in: userProfileId}});

  const ageRange = userDetails.recommendationPreferences.ageRange;

  if(userDetails.permission != 1){


    if(userDetails.recommendationPreferences.college != null && ageRange.min != null && ageRange.max != null){
      users = users.filter((item) => {
        if(item.age < ageRange.max && item.age > ageRange.min && userDetails.recommendationPreferences.college == item.college){
          return item;
        }
      });
    }else if(ageRange.min != null && ageRange.max != null){
      users = users.filter((item) => {
        if(item.age < ageRange.max && item.age > ageRange.min){
          return item;
        }
      });
    }else if(userDetails.recommendationPreferences.college != null){
      users = users.filter((item) => {
        if(userDetails.recommendationPreferences.college == item.college){
          return item;
        }
      });
    }


  }else{
    if(ageRange.min != null && ageRange.max != null){
      users = users.filter((item) => {
        if(item.age < ageRange.max && item.age > ageRange.min){
          return item;
        }
      });
    }
  }

  const objectLength = Object.keys(users).length

  return users;
}

module.exports.home = async function(req, res){
  // This function show opposite gender profile to the loggedIN profile on the basis of loggedin user's preferences.

  var loopCount = 3;
  var users = null;

  while(loopCount > 0){
    const temp = await potentialProfileAlgorith(req, res);

    if(users == null){
      users = temp;
    }else if(temp.length > users.length){
      users = temp;
    }

    if(users.length >= 10) break;

    loopCount--;
  }

  return res.json({
    userList: users
  })
}

module.exports.like = async function(req, res){
  // userId have the id of user who give the like
  const userId = req.user.userId;

  // profileId have the id of the user who get the like
  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try{
    await user_details.updateOne({userId: profileId}, {
      $addToSet: {like: userId }
    });

    await user_details.updateOne({userId: userId}, {
      $addToSet: {showProfile: profileId }
    });

    return res.status(200).json({
      message: "Liked Done!"
    })
  }catch (error) {
    return res.status(401).json({
      message: `Failed in like the profile -> ${error}`
    })
  }

}

module.exports.nope = async function(req, res){
  // userId have the id of user who give the like
  const userId = req.user.userId;

  // profileId have the id of the user who get the like
  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try{
    await user_details.updateOne({userId: userId}, {
      $addToSet: {showProfile: profileId }
    });

    return res.status(200).json({
      message: "Unlike profile"
    })
  }catch (error) {
    return res.status(401).json({
      message: `Failed in Unlike the profile -> ${error}`
    })
  }


}
