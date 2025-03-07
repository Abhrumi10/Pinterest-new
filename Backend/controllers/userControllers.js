import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import TryCatch from "../utils/TryCatch.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = TryCatch(async(req,res) => {
    const {name,email,password} = req.body

    let user = await User.findOne({email})

    if(user) return res.status(400).json({
        message:"Already Have An Account With This Email"
    });

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({
         name,
         email,
         password: hashPassword
    });

    generateToken(user._id,res);

    res.status(201).json({
        user,
        message: "User Registeredd Successfully"
    });
})

export const loginUser = TryCatch(async (req,res) => {
    const {email,password} = req.body 

    const user = await User.findOne({email});

    if(!user)
        return res.status(400).json({
          message: "User Not Found"
});

     const comparePassword = await bcrypt.compare(password, user.password);

     if(!comparePassword)
        return res.status(400).json({
          message: "Wrong Password"
});

      generateToken(user._id,res);

        res.json({
        user,
        message: "Logged In Successfully"
    });
});

    export const myProfile = TryCatch(async(req,res)=> {
        const user = await User.findById(req.user._id);
        res.json(user);
    });

    export const userProfile = TryCatch(async(req,res)=> {
        const user = await User.findById(req.params.id).select("-password");
        res.json(user);
    });

    export const FollowAndUnfollowUser = TryCatch(async(req,res)=> {
        const user = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id)

        if(!user)
            return res.status(400).json({
             message: "No User Found With This Id"
            });

        if(user._id.toString() === loggedInUser._id.toString())
            return res.status(400).json({
             message: "You Can't Follow Yourself"
            });

        if(user.followers.includes(loggedInUser._id)) {
            const indexFollowing = loggedInUser.following.indexOf(user._id);
            const indexFollower = user.followers.indexOf(loggedInUser._id);

            loggedInUser.following.splice(indexFollowing, 1);
            user.followers.splice(indexFollower, 1);

            await loggedInUser.save()
            await user.save()

            res.json({
                message: "User Unfollowed"
            })
        } else{
            loggedInUser.following.push(user._id);
            user.followers.push(loggedInUser._id);

            await loggedInUser.save()
            await user.save()

            res.json({
                message: "User Followed"
            })

        }
    });

    export const logOutUser = TryCatch(async (req,res) => {
      res.cookie("token", "", {maxAge: 0});

      res.json({
        message: "Logged Out Successfully"
      });
    });