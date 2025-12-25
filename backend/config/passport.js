const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Google OAuth configured successfully');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (result.rows.length > 0) {
        // User exists, return user
        return done(null, result.rows[0]);
      }

      // Check if user exists with same email
      result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [profile.emails[0].value]
      );

      if (result.rows.length > 0) {
        // Link Google account to existing user
        const updatedUser = await pool.query(
          'UPDATE users SET google_id = $1, auth_provider = $2, profile_picture_url = $3 WHERE email = $4 RETURNING *',
          [profile.id, 'google', profile.photos[0].value, profile.emails[0].value]
        );
        return done(null, updatedUser.rows[0]);
      }

      // Create new user
      const newUser = await pool.query(
        `INSERT INTO users (username, email, google_id, auth_provider, profile_picture_url, is_profile_complete) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          profile.displayName || profile.emails[0].value.split('@')[0],
          profile.emails[0].value,
          profile.id,
          'google',
          profile.photos[0].value,
          false
        ]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;