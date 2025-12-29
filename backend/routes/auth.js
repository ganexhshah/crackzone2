const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, auth_provider, is_profile_complete) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, created_at',
      [username, email, hashedPassword, 'local', true]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, username, email, password_hash, auth_provider, is_profile_complete FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user registered with Google
    if (user.auth_provider === 'google') {
      return res.status(400).json({ error: 'Please sign in with Google' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isProfileComplete: user.is_profile_complete
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Google OAuth not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Mobile Google OAuth route
router.get('/google/mobile', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Google OAuth not configured' });
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: 'mobile' // Mark this as mobile request
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const isMobile = req.query.state === 'mobile';
    if (isMobile) {
      return res.redirect(`exp://192.168.18.13:19000/--/auth/callback?error=oauth_not_configured`);
    }
    return res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('google', { session: false }, async (err, user) => {
    const isMobile = req.query.state === 'mobile';
    
    if (err) {
      console.error('Google callback error:', err);
      if (isMobile) {
        return res.redirect(`exp://192.168.18.13:19000/--/auth/callback?error=auth_failed`);
      }
      return res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
    }
    
    if (!user) {
      if (isMobile) {
        return res.redirect(`exp://192.168.18.13:19000/--/auth/callback?error=auth_failed`);
      }
      return res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
    }

    try {
      // Generate JWT for the user
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect based on platform
      if (isMobile) {
        const redirectUrl = `exp://192.168.18.13:19000/--/auth/callback?token=${token}&profileComplete=${user.is_profile_complete}`;
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `${process.env.CORS_ORIGIN}/auth/callback?token=${token}&profileComplete=${user.is_profile_complete}`;
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Google callback error:', error);
      if (isMobile) {
        res.redirect(`exp://192.168.18.13:19000/--/auth/callback?error=auth_failed`);
      } else {
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`);
      }
    }
  })(req, res, next);
});

// Update game preference
router.post('/update-game-preference', authenticateToken, async (req, res) => {
  try {
    const { game } = req.body;
    const userId = req.user.id;

    if (!game) {
      return res.status(400).json({ error: 'Game selection is required' });
    }

    // Update user's primary game
    await pool.query(
      'UPDATE users SET primary_game = $1 WHERE id = $2',
      [game, userId]
    );

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, username, email, profile_picture_url, is_profile_complete, primary_game FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      message: 'Game preference updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Game preference update error:', error);
    res.status(500).json({ error: 'Failed to update game preference' });
  }
});

// Complete game profile with file upload
router.post('/complete-game-profile', authenticateToken, async (req, res) => {
  try {
    const { uploadProfile } = require('../config/cloudinary');
    
    // Use multer middleware for file upload
    uploadProfile.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { username, game, gameUid, gameUsername } = req.body;
      const userId = req.user.id;

      if (!username || !game) {
        return res.status(400).json({ error: 'Username and game selection are required' });
      }

      // Check if username is taken
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      try {
        // Update user profile
        let profilePictureUrl = null;
        if (req.file) {
          profilePictureUrl = req.file.path; // Cloudinary URL
        }

        const updateFields = ['username = $1', 'is_profile_complete = $2', 'primary_game = $3'];
        const updateValues = [username, true, game, userId];
        
        if (profilePictureUrl) {
          updateFields.push('profile_picture_url = $4');
          updateValues.splice(-1, 0, profilePictureUrl); // Insert before userId
        }

        await pool.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`,
          updateValues
        );

        // Add game profile if provided
        if (gameUid && game === 'freefire') {
          await pool.query(
            'INSERT INTO game_profiles (user_id, game, game_uid, game_username, is_primary) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, game) DO UPDATE SET game_uid = $3, game_username = $4, is_primary = $5',
            [userId, game, gameUid, gameUsername || null, true]
          );
        }

        // Get updated user data
        const updatedUser = await pool.query(
          'SELECT id, username, email, profile_picture_url, is_profile_complete, primary_game FROM users WHERE id = $1',
          [userId]
        );

        res.json({
          message: 'Profile completed successfully',
          user: updatedUser.rows[0]
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Failed to complete profile' });
      }
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// Complete profile after Google OAuth (legacy endpoint)
router.post('/complete-profile', authenticateToken, async (req, res) => {
  try {
    const { username, game, gameUid } = req.body;
    const userId = req.user.id;

    if (!username || !game) {
      return res.status(400).json({ error: 'Username and game selection are required' });
    }

    // Check if username is taken
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update user profile
    await pool.query(
      'UPDATE users SET username = $1, is_profile_complete = $2, primary_game = $3 WHERE id = $4',
      [username, true, game, userId]
    );

    // Add game profile if provided
    if (gameUid && game === 'freefire') {
      await pool.query(
        'INSERT INTO game_profiles (user_id, game, game_uid, is_primary) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, game) DO UPDATE SET game_uid = $3, is_primary = $4',
        [userId, game, gameUid, true]
      );
    }

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, username, email, profile_picture_url, is_profile_complete, primary_game FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      message: 'Profile completed successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, is_profile_complete, auth_provider FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isProfileComplete: user.is_profile_complete,
        authProvider: user.auth_provider
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;