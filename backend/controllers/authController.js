const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
 
  const user = await User.findOne({ username });
  console.log('Login attempt:', username, 'found user:', user);
  console.log('Login attempt:', username, 'found user:', user);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  // const match = await bcrypt.compare(password, user.passwordHash);
  // if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role }
  });
};
