/*const express = require('express');
const router = express.Router();
const users = require('./users'); 

router.post('/', (req, res) => {
    const { email, password, repeat_password, username, phone, age, gender } = req.body;

    if (password !== repeat_password) {
        return res.send('<h2 style="color:red;">Пароли не совпадают</h2>');
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.send('<h2 style="color:red;">Пользователь с таким e-mail уже существует</h2>');
    }

    const newUser = { email, password, username, phone, age, gender };
    users.push(newUser);

    res.send('<h2>Регистрация успешна! Теперь вы можете войти</h2> <a href="/Vhod_account.html">Перейти ко входу</a>');
});

module.exports = router;
*/
app.post('/Create_acc', (req, res) => {
  const { email, password, repeat_password, username, phone, age, gender } = req.body;

  if (password !== repeat_password) {
    return res.send('<h2 style="color:red;">Пароли не совпадают</h2>');
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.send('<h2 style="color:red;">Такой e-mail уже зарегистрирован</h2>');
  }

  const recoveryCode = generateRecoveryCode();

  const newUser = { email, password, username, phone, age, gender, recoveryCode };
  users.push(newUser);
  saveUsers(); 

  res.send(`
      <h2>Регистрация успешна!</h2>
      <p>Ваш код восстановления пароля: <strong>${recoveryCode}</strong></p>
      <a href="/Vhod_account.html">Войти</a>
  `);
});


/*
const express = require('express');
const router = express.Router();
const User = require('./User'); 

router.post('/', async (req, res) => {
    const { email, password, repeat_password, username, phone, age, gender } = req.body;

    if (password !== repeat_password) {
        return res.send('<h2 style="color:red;">Пароли не совпадают</h2>');
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send('<h2 style="color:red;">Пользователь с таким e-mail уже существует</h2>');
        }

        const newUser = new User({
            email,
            password,
            username,
            phone,
            age: new Date(age),
            gender
        });
        await newUser.save();
        res.send('<h2>Регистрация успешна! Теперь вы можете войти</h2> <a href="/Vhod_account.html">Перейти ко входу</a>');

    } catch (error) {
        console.error(error);
        res.send('<h2 style="color:red;">Ошибка при регистрации</h2>');
    }
});

module.exports = router;
*/
