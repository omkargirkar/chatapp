const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.addUser = async (req, res) => {
  
  const { username, email, tel, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (username, email, phonenumber, password) VALUES (?, ?, ?, ?)',
      [username, email, tel, hashedPassword]
    );

    const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'User signup received and stored successfully',
      user: newUser[0]
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(403).json({ error: 'User already exists. Please Login.' });
    }
    res.status(500).json({ error: 'Failed to store user data' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userResult] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // If no user with the given email
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password incorrect. User not authorized.' });
    }

    // If both email and password match, token created

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your_jwt_secret_key',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      message: 'User login successful',
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed due to server error' });
  }
};