const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Función de registro
const registerUser = async (req, res) => {
  const { email, password, recaptchaResponse } = req.body;

  // Verificación de reCAPTCHA
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaResponse}`;
  
  try {
    const response = await axios.post(recaptchaUrl);
    if (!response.data.success) {
      return res.status(400).send('Falló la verificación de reCAPTCHA');
    }

    const user = new User({ email, password });
    await user.save();
    res.status(201).send('Usuario registrado');
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
};

// Función de inicio de sesión
const loginUser = async (req, res) => {
  const { email, password, recaptchaResponse } = req.body;

  // Verificación de reCAPTCHA
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaResponse}`;

  try {
    const response = await axios.post(recaptchaUrl);
    if (!response.data.success) {
      return res.status(400).send('Falló la verificación de reCAPTCHA');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send('Credenciales inválidas');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
};

// Función para recuperar contraseña
const recoverPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(400).send('El email no está registrado');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Recuperación de Contraseña',
    text: 'Haz clic en el enlace para recuperar tu contraseña.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error al enviar el correo');
    }
    res.status(200).send('Correo de recuperación enviado');
  });
};

module.exports = { registerUser, loginUser, recoverPassword };
