import { User } from "../models/User.js";
import { generateJWT } from "../utils/generateJWT.js";

const generateAccessandRefreshToken = async (userId) => {
  //! access token is given to user
  //! refresh token is given to user and stored in the database so there is no need to ask the password again and agian

  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // how to add value to the object(user)
    // validateBeforeSave is used to avoid the validation error

    //! At this step we are storing the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, date_of_birth, gender } = req.body;

    //edge cases

    if (!username || !email || !password || !date_of_birth || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if user already exists
    const UserExists = await User.findOne({ email });

    if (UserExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const user = await User.create({
      username,
      email,
      password,
      date_of_birth,
      gender,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token: generateJWT(user._id, user.email),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password" - "refreshToken"
    );

    console.log(loggedInUser);

    const options = {
      httpOnly: true,
      secure: true,
    };

    //! At this step we are sending the access token and refresh token to the user
    //! we have to decide what information we want to send to the user

    res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json({
        success: true,
        message: "User logged in successfully",
        user: loggedInUser,
        token: { accessToken, refreshToken },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const incomingRefreshAccessToken = async (req, res, next) => {
  //!Extract the token from the request of incoming Token
  //!Decode the token: take info out of it
  //!Compare the token with the one in the database
  //!If the token is valid, generate a new access token

  try {
    const { incomingRefreshAccessToken } =
      req.cookies || req.headers.authorization.split(" ")[1];

    console.log(incomingRefreshAccessToken);

    if (!incomingRefreshAccessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      incomingRefreshAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(decoded?.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (user?.refreshToken !== incomingRefreshAccessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json({
        success: true,
        message: "Access token refreshed successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
