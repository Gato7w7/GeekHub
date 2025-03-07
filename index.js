// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://admin:admin123@localhost:27017/login?authMechanism=DEFAULT&authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  mfaCode: String,
  mfaVerified: { type: Boolean, default: false }
});
const User = mongoose.model('usuarios', UserSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = new User({ email, password: hashedPassword, mfaCode });
  await newUser.save();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Código MFA de Registro',
      text: `Tu código de autenticación es: ${mfaCode}`
    });
    res.json({ message: 'Usuario registrado. Código MFA enviado.' });
  } catch (error) {
    console.error('Error enviando el correo:', error);
    res.status(500).json({ message: 'Error al enviar el código MFA' });
  }
});

app.post('/verify-mfa', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.mfaCode !== code) {
    return res.status(400).json({ message: 'Código incorrecto' });
  }

  user.mfaVerified = true;
  user.mfaCode = null;
  await user.save();

  res.json({ message: 'MFA verificado con éxito. Ahora puedes iniciar sesión.' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

  if (!user.mfaVerified) {
    return res.status(400).json({ message: 'Debes verificar el MFA antes de iniciar sesión.' });
  }

  const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
  res.json({ message: 'Inicio de sesión exitoso', token });
});

app.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    console.log('Usuario no encontrado:', email);
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: 'Contraseña cambiada exitosamente' });
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));
