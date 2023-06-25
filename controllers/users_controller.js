const user_credentials = require('../models/user_credentials');
const user_details = require('../models/user_details');
const maleList = require('../models/male_list');
const femaleList = require('../models/female_list');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
          // phone: input.phone,
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

function countFilesInFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.length);
      }
    });
  });
}

// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: 'C:/Users/nikhi/Desktop/react2/Dating/BackEnd/assets/image', // Replace with the actual folder path
  filename: (req, file, cb) => {
    // Get the current file count in the folder
    const folderPath = 'C:/Users/nikhi/Desktop/react2/Dating/BackEnd/assets/image'; // Replace with the actual folder path
    const fileCount = fs.readdirSync(folderPath).length;

    const filename = `${fileCount + 1}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Create the multer middleware
const upload = multer({ storage });

module.exports.imageUploader = function (req, res) {
  const folderPath = 'C:/Users/nikhi/Desktop/react2/Dating/BackEnd/assets/image'; // Replace with the actual folder path

  upload.single('image')(req, res, function (err){

      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      countFilesInFolder(folderPath)
      .then(fileCount => {
        const filename = req.file.originalname;
        res.json({ image: `${fileCount}${path.extname(filename)}` });
      })
    });
};

module.exports.userDetails = async function(req, res){
    const input = req.body;

    const newUserId = await user_credentials.findOne({
        $or: [
          // { phone: input.phone },
          { email: input.email }
        ]
    }, { userId: 1 });

    await user_credentials.updateOne({
      $or: [
        { email: input.email }
      ]
    }, { $set: { avatar: input.avatar}})
    try {
        await user_details.create({
          userId: newUserId.userId,
          name: input.name,
          email: input.email,
          // phone: input.phone,
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

const calcDistance = async (startCoords, destCoords) =>{
  let startingLat = (startCoords.lat* Math.PI)/180;
  let startingLong = (startCoords.long* Math.PI)/180;
  let destinationLat = (destCoords.lat* Math.PI)/180;
  let destinationLong = (destCoords.long* Math.PI)/180;

  // Radius of the Earth in kilometers
  let radius = 6571;

  // Haversine equation
  let distanceInKilometers = Math.acos(Math.sin(startingLat) * Math.sin(destinationLat) +
  Math.cos(startingLat) * Math.cos(destinationLat) *
  Math.cos(startingLong - destinationLong)) * radius;

  return distanceInKilometers;
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

  // Removed the userId who already present in any one of these list.
  const showProfile = userDetails.showProfile;
  const like = userDetails.like;
  const superLike = userDetails.superLike;
  const match = userDetails.showProfile;
  // const block = userDetails.block;

  userProfileId = userProfileId.filter((element) => !showProfile.includes(element) && !like.includes(element) && !superLike.includes(element) && !match.includes(element));

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

  const modifiedArray = await Promise.all(users.map(async ({ 
    userId, name, age, my_basic, image, college, relationship_goals, languages, gender, interest, city, verified, location
  }) => {
    const radiusPromise = calcDistance(location, userDetails.location);
    const radius = await radiusPromise;
    const numericRadius = Number(radius.toFixed(0));

    return {
      userId, name, age, my_basic, image, college, relationship_goals, languages, gender, interest, city, verified, radius: numericRadius
    };
  }));
  

  return modifiedArray;
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

module.exports.superLike = async function(req, res){
  // userId have the id of user who give the like
  const userId = req.user.userId;

  // profileId have the id of the user who get the like
  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try{
    await user_details.updateOne({userId: profileId}, {
      $addToSet: {superLike: userId }
    });

    await user_details.updateOne({userId: userId}, {
      $addToSet: {showProfile: profileId }
    });

    return res.status(200).json({
      message: "super Liked Done!"
    })
  }catch (error) {
    return res.status(401).json({
      message: `Failed in super like the profile -> ${error}`
    })
  }

}

module.exports.editProfile = async function(req, res){
  const userId = req.user.userId;

  try{
    await user_details.updateOne({userId: userId}, req.body);

    return res.json({
      message: "Profile Updated"
    })
  }catch(error){
    return res.json({
      message: `Failed in Updating the profile -> ${error}`
    })
  }
}

module.exports.matchProfile = async function(req, res){
  const userId = req.user.userId;

  var profileId = req.params.profileId;
  // Converting profileId String to integer
  profileId = parseInt(profileId);

  var likeArr = await user_details.findOne({userId: userId}, {like: 1 });
  likeArr = likeArr.like;

  var likeArr2 = await user_details.findOne({userId: profileId}, {like: 1 });
  likeArr2 = likeArr2.like;

  const likeExist2 = likeArr2.includes(userId);

  if(likeExist2){
    // Remove prodile id from like list
    await user_details.updateOne({userId: profileId}, {
      $pull: {like: userId }
    });  
  }

  const likeExist = likeArr.includes(profileId);

  if(likeExist){
    // Insert profile id inside match list of userId
    await user_details.updateOne({userId: userId}, {
      $addToSet: {match: profileId }
    });    

    // Insert userId inside match list of profileId
    await user_details.updateOne({userId: profileId}, {
      $addToSet: {match: userId }
    }); 

    // Remove prodile id from like list
    await user_details.updateOne({userId: userId}, {
      $pull: {like: profileId }
    });  
    
    return res.status(200).json({
      message: "Profile matched!"
    })
  }else{
    return res.status(500).json({
      message: "Something went wrong!  You try to match profile that not exist in your like list."
    })
  }
}

module.exports.notmatchProfile = async function(req, res){
  const userId = req.user.userId;

  var profileId = req.params.profileId;
  // Converting profileId String to integer
  profileId = parseInt(profileId);

  var likeArr = await user_details.findOne({userId: userId}, {like: 1 });
  likeArr = likeArr.like;

  const likeExist = likeArr.includes(profileId);

  if(likeExist){
    // Remove prodile id from like list
    await user_details.updateOne({userId: userId}, {
      $pull: {like: profileId }
    });  
    
    return res.status(200).json({
      message: "Profile not matched!"
    })
  }else{
    return res.status(500).json({
      message: "Something went wrong!  You try to reject profile that not exist in your like list."
    })
  }
}

module.exports.undomatchProfile = async function(req, res){
  const userId = req.user.userId;

  var profileId = req.params.profileId;
  // Converting profileId String to integer
  profileId = parseInt(profileId);
  
  try{
    await user_details.updateOne({userId: userId}, {
      $pull: {match: profileId }
    });    
  
    // Insert userId inside match list of profileId
    await user_details.updateOne({userId: profileId}, {
      $pull: {match: userId }
    }); 

    return res.status(200).json({
      message: "Profile unmatched!"
    })
  }catch(error){
    return res.status(500).json({
      message: "Something went wrong!"
    })
  }

}

module.exports.block = async function(req, res){
  const userId = req.user.userId;

  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try{
    await user_details.updateOne({userId: userId}, {
      $addToSet: {block: profileId }
    }); 

    return res.status(200).json({
      message: "Block profile"
    })
  }catch(err){
    return res.status(500).json({
      message: "Something went Wrong!"
    })
  }

}