const db = require('../db');
const bcrypt = require('bcrypt');

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
      return res.status(403).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Failed to store user data' });
  }
};