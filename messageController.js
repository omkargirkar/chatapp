const db = require('../db');

exports.storeMessage = async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ message: 'Message and userId are required' });
  }

  try {
    await db.execute('INSERT INTO messages (message, userId) VALUES (?, ?)', [message, userId]);
    res.status(201).json({ message: 'Message stored successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [messages] = await db.execute(
      `SELECT messages.message, messages.createdAt, users.username 
       FROM messages 
       JOIN users ON messages.userId = users.id 
       ORDER BY messages.createdAt ASC`
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
