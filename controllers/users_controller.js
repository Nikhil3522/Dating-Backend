const user_credentials = require('../models/user_credentials');
const user_details = require('../models/user_details');
const maleList = require('../models/male_list');
const femaleList = require('../models/female_list');
const Message = require('../models/message');
const Subscription = require('../models/subscription');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mailer = require('../config/mailer');
var nodemailer = require('nodemailer');
const passport = require('passport');
const jwt = require('jsonwebtoken');

var OTP_for_mail_verification = {};

var likeLimit = {};

module.exports.mailVerify = function(req, res){
  const mailId = req.body.mailId;

  const otp = Math.floor(1000 + Math.random() * 9000);
  OTP_for_mail_verification[mailId] = otp;

  var mailOptions = {
    from: process.env.MAILER_USER,
    to: mailId,
    subject: "OTP to Verify Email",
    html: `<p>Hi ${req.body.name},</p>
    <p>Your One Time Password(OTP) is :</p>
    <h3>${OTP_for_mail_verification[mailId]}</h3>
    `
  }

  // console.log("otp", OTP_for_mail_verification);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS 
    }
  });

  transporter.sendMail(mailOptions, function(err, info){
    if(err){
      return res.status(500).json({message: `Something Went wrong for send OTP. ${err}`});
    } else {
      return res.status(200).json({message: `Email sent: ${info.response}`});
    }
  })

}

module.exports.createUser = async function(req, res){
  if(req.body.otp == OTP_for_mail_verification[req.body.email]){
    delete OTP_for_mail_verification[req.body.email];
    const input = req.body;
    let encryptPassword = await bcrypt.hash(input.password, 10);
    var totalUsers = await user_credentials.find().sort({userId: -1}).limit(1);

    var newUserId = 0;

    if(totalUsers[0]){
      newUserId = totalUsers[0].userId + 1;
    }

    // var newUserId = totalUsers[0].userId + 1;
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
  }else{
    return res.status(401).json({
      message: 'Wrong OTP'
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
  destination: path.join(__dirname, '../assets/image'), // Replace with the actual folder path
  filename: (req, file, cb) => {
    // Get the current file count in the folder
    const folderPath = path.join(__dirname, '../assets/image'); // Replace with the actual folder path
    const fileCount = fs.readdirSync(folderPath).length;

    const filename = `${fileCount + 1}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Create the multer middleware
const upload = multer({ storage });

module.exports.imageUploader = function (req, res) {
  const folderPath = path.join(__dirname, '../assets/image'); // Replace with the actual folder path

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

    // console.log("edited Detail", input);
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
          bio: input.bio,
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
  // console.log("req", req);
  // console.log("res", res);
  return res.json({
    message: "User LoggedIN!"
  })

  // passport.authenticate('local', { session: false }, (err, user, info) => {
  //   if (err || !user) {
  //     return res.status(401).json({ message: 'Invalid username or password' });
  //   }

  //   // If authentication is successful, generate a JWT token
  //   const token = jwt.sign({ userId: user.id }, 'your_secret_key');

  //   // Return the token as the response
  //   return res.json({ token });
  // })(req, res, next);
}

module.exports.wrongCredential = async function(req, res){
  return res.json({
    message: "Wrong Email or Passwod!"
  })
}

var OTP_for_forget_password = {};

module.exports.forgetPasswordOTP = async function(req, res){
  const mailId = req.body.mailId;

  const checkUserExist = await user_credentials.findOne({email: mailId});

  if(checkUserExist){
    const otp = Math.floor(1000 + Math.random() * 9000);
    OTP_for_forget_password[mailId] = otp;

    var mailOptions = {
      from: process.env.MAILER_USER,
      to: mailId,
      subject: "OTP to Reset Password",
      html: `<p>Hi,</p>
      <p>Your One Time Password(OTP) is :</p>
      <h3>${OTP_for_forget_password[mailId]}</h3>
      `
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS 
      }
    });

    transporter.sendMail(mailOptions, function(err, info){
      if(err){
        return res.status(500).json({message: `Something Went wrong for send OTP. ${err}`});
      } else {
        return res.status(200).json({message: `Email sent: ${info.response}`});
      }
    })
  }else{
    return res.status(200).json({message: 'Email id is not exist.', emailNotExist: true});
  }
}

module.exports.forgetPasswordOTPVerify = async function(req, res){
  if(req.body.otp == OTP_for_forget_password[req.body.email]){
    delete OTP_for_forget_password[req.body.email];
    return res.status(201).json({
      message: 'OTP Matched'
    })
  }else{
    return res.status(201).json({
      message: 'Wrong OTP'
    });
  }
}

module.exports.newPassword = async function(req, res){
  const input = req.body;

  try{
    let encryptPassword = await bcrypt.hash(input.password, 10);

    await user_credentials.updateOne(
      {email: input.email},
      { $set: { password: encryptPassword } }
    );

    return res.status(201).json({
      message: "Password Changed"
    })
  }catch{
    return res.status(500).json({
      message: "Something went wrong"
    })
  }

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
  var showProfile = userDetails.showProfile;
  showProfile = showProfile.map((item) => item.profileId);
  const like = userDetails.like;
  const superLike = userDetails.superLike;
  const match = userDetails.match;
  const block = userDetails.block;

  userProfileId = userProfileId.filter((element) => !showProfile.includes(element) && !like.includes(element) && !superLike.includes(element) && !match.includes(element) && !match.includes(block));

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
    userId, name, age, my_basic, image, college, relationship_goals, languages, gender, interest, city, verified, location, bio
  }) => {
    const radiusPromise = calcDistance(location, userDetails.location);
    const radius = await radiusPromise;
    const numericRadius = Number(radius.toFixed(0));

    return {
      userId, name, age, my_basic, image, college, relationship_goals, languages, gender, interest, city, verified, radius: numericRadius, bio
    };
  }));
  

  return modifiedArray;
}

module.exports.myDetail = async function(req, res){
  const userId = req.user.userId;

  const userDetails = await user_details.findOne({userId: userId});
  
  if(userDetails){
    return res.status(200).json({
      data: userDetails
    })
  }else{
    const userCredential = await user_credentials.findOne({userId: userId});

    return res.json({
      message: "User not exist",
      data: userCredential
    })
  }

  return res.status(400).json({
    message: "Something went wrong to find user detail"
  })
}

module.exports.myLike = async function(req, res){
  const userId = req.user.userId;

  var permission = await user_details.findOne({ userId: userId }, { permission: 1 });
  permission = permission.permission;
  var like = await user_details.findOne({ userId: userId }, { like: 1 });
  like = like.like;

  if(permission > 1){
    if(like){
      return res.status(200).json({
          data: like
      })
    }
  }else{
    const length = like.length;
    return res.status(200).json({
      data: length,
      permission: 1
    })
  }

  return res.status(400).json({
    message: "Something went wrong to find user detail"
  })
}

module.exports.home = async function(req, res){
  const userId = req.user.userId;

  var permission = await user_details.findOne({ userId: userId }, { permission: 1 });
  permission = permission.permission;
  
  if(likeLimit[userId] >= 10 && permission === 1){
    return res.status(429).json({
      message: 'Today limit is exceed'
    })
  }

  // This function show opposite gender profile to the loggedIN profile on the basis of loggedin user's preferences.

  // var loopCount = 3;
  // var users = null;

  // while(loopCount > 0){
    const temp = await potentialProfileAlgorith(req, res);

    // if(users == null){
    //   users = temp;
    // }else if(temp.length > users.length){
      users = temp;
  //   }

  //   if(users.length >= 10) break;

  //   loopCount--;
  // }

  return res.json({
    userList: users
  })
}

module.exports.getUserDetail = async function(req, res){
  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  const profileDetails = await user_details.findOne({userId: profileId});

  const temp =  {
    _id: profileDetails._id,
    name: profileDetails.name,
    age: profileDetails.age,
    avatar: profileDetails.avatar
  }

  if(profileDetails){
    return res.status(200).json({
      data: temp
    })
  }

  return res.status(400).json({
    message: "Something went wrong to find profile detail"
  })
}

module.exports.getProfileDetail = async function(req, res){
  const userId = req.user.userId;

  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  var likeArr = await user_details.findOne({userId: userId}, {like: 1 });
  var matchArr = await user_details.findOne({userId: userId}, {match: 1 });

  console.log(likeArr.like);
  console.log(matchArr.match);

  if(likeArr.like.includes(profileId) || matchArr.match.includes(profileId)){
    const profileDetails = await user_details.findOne({userId: profileId});

    const temp =  {
      _id: profileDetails._id,
      name: profileDetails.name,
      age: profileDetails.age,
      avatar: profileDetails.avatar,
      college: profileDetails.college,
      image: profileDetails.image,
      interest: profileDetails.interest,
      location: profileDetails.location,
      city: profileDetails.city,
      verified: profileDetails.verified,
      languages: profileDetails.languages
    }
  
    if(profileDetails){
      return res.status(200).json({
        data: temp
      })
    }
  }else{
    return res.status(500).json({
      message: "This data is not accessable for you"
    })
  }

  return res.status(400).json({
    message: "Something went wrong to find profile detail"
  })
}

module.exports.like = async function(req, res){
  // userId have the id of user who give the like
  const userId = req.user.userId;

  // profileId have the id of the user who get the like
  var profileId = req.params.profileId;
  profileId = parseInt(profileId);

  try{

    var permission = await user_details.findOne({ userId: userId }, { permission: 1 });
    permission = permission.permission;

    if(likeLimit[userId] >= 10 && permission === 1){
      return res.status(429).json({
        message: 'Today limit is exceed'
      })
    }

    await user_details.updateOne({userId: profileId}, {
      $addToSet: {like: userId }
    });

    const now = new Date();
    const isoString = now.toISOString();

    await user_details.updateOne({userId: userId}, {
      $addToSet: {showProfile: {"profileId": profileId, "timestamp": isoString} }
    });

    if(likeLimit[userId]){
      likeLimit[userId]++;
    }else{
      likeLimit[userId] = 1;
    }

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
    const now = new Date();
    const isoString = now.toISOString();

    await user_details.updateOne({userId: userId}, {
      $addToSet: {showProfile: {"profileId": profileId, "timestamp": isoString} }
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

  const reqData = JSON.parse(Object.keys(req.body)[0]);

  try{
    await user_details.updateOne({userId: userId}, {recommendationPreferences: reqData.recommendationPreferences});

    return res.json({
      message: "Profile Updated"
    })
  }catch(error){
    return res.json({
      message: `Failed in Updating the profile -> ${error}`
    })
  }
}

module.exports.editProfile2 = async function(req, res){
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

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: profileId },
        { sender: profileId, receiver: userId }
      ]
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
      $pull: {match: profileId }
    });  
    
    await user_details.updateOne({userId: userId}, {
      $addToSet: {block: profileId }
    }); 
  
    await user_details.updateOne({userId: profileId}, {
      $pull: {match: userId }
    }); 

    await user_details.updateOne({userId: profileId}, {
      $addToSet: {block: userId }
    }); 

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: profileId },
        { sender: profileId, receiver: userId }
      ]
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

module.exports.cleanupShowProfile = async function(){
  const now = new Date();

  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const dateTimeString = now.toLocaleString('en-US', options);
  console.log("cleanupShowProfile Function Executed!", dateTimeString);

  try {
    // Calculate the cutoff time (e.g., 60 hours ago)
    const cutoffTime = new Date(Date.now() - 60 * 60 * 60 * 1000);

    // Find and update userdetails for each user
    const users = await user_details.find({}, {showProfile: 1});
    users.forEach(async (user) => {
      user.showProfile = user.showProfile.filter((profile) => profile.timestamp > cutoffTime);
      await user.save();
    });
  } catch (error) {
    console.error('Cleanup task error:', error);
  }
}

module.exports.resetLikeLimit = async function(){
  const now = new Date();

  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const dateTimeString = now.toLocaleString('en-US', options);
  console.log("Reset Like Limit", dateTimeString);

  try{
    likeLimit = {};
  }catch(err){
    console.log('Error in resetLikeLimit function', err);
  }
}

module.exports.checkSubscription = async function(){
  console.log("Check Subscription");

  try{
    const data = await user_details.find({ permission: { $ne: 1 }}, { userId: 1 });

    data.forEach(async (user) => {
      var dateToCheck = await Subscription.find({userId: user.userId}, {finalDate: 1}).sort({ _id: -1 }).limit(1);
      dateToCheck = dateToCheck[0].finalDate;

      const currentDate = new Date();
  
      if (dateToCheck < currentDate) {
        await user_details.updateOne({userId: user.userId}, {permission: 1});
      }
  
    })
  }catch(err){
    console.log("Error in checkSubscription function", err);
  }
}