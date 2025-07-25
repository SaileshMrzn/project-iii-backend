import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// export const googleAuth = async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     res.status(400).json({ message: "No token provided" });
//     return;
//   }
//   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();

//     let user = await User.findOne({ googleId: payload.sub });
//     if (!user) {
//       user = await User.create({
//         googleId: payload.sub,
//         name: payload.name,
//         email: payload.email,
//         picture: payload.picture,
//       });
//     }

//     const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res
//       .status(200)
//       .cookie("token", jwtToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 24 * 60 * 60 * 1000, // 1 day
//       })
//       .json({ message: "Logged in", user });
//   } catch (error) {
//     console.error(error);
//     res.json({ message: "Invalid token" });
//   }
// };

// export const googleAuth = async (req, res) => {
//   const { id, email, name, provider, image } = req.body;

//   if (!email || !id || !provider) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // Check if user exists by email OR by authId
//     let user = await User.findOne({
//       $or: [{ email: email }, { authId: id }],
//     });

//     if (!user) {
//       // Create new user
//       user = new User({
//         authId: id, // Store Google's ID in authId field
//         email,
//         name,
//         provider,
//         image, // Use the image from NextAuth if available
//       });
//       await user.save();
//     } else {
//       // Update existing user if found
//       user.name = name;
//       user.provider = provider;
//       user.authId = id;
//       if (image) {
//         user.image = image;
//       }
//       await user.save();
//     }

//     // For NextAuth, we only need to return the user data
//     // NextAuth will handle session management and JWT generation
//     return res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         image: user.image,
//         provider: user.provider,
//       },
//     });
//   } catch (err) {
//     console.error("Error handling Google auth sync:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const jwtToken = jwt.sign(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      res
        .status(200)
        .cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        })
        .json({
          message: "Logged in successfully",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
