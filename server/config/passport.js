const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google OAuth profile received:", {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value
        });

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("👤 Creating new user from Google profile");
          user = await User.create({
            username: profile.displayName,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
          });
          console.log("✅ New user created:", user._id);
        } else {
          console.log("👤 Existing user found:", user._id);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Error in Google OAuth strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
