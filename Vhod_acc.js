const express = require('express');
const path = require('path');
const router = express.Router();
//const users = require('./users'); 

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vhod_account.html'));
});

router.post('/', (req, res) => {
    const { email_login, password_login } = req.body;

    const user = users.find(u => u.email === email_login);

    if (!user || user.password !== password_login) {
        return res.send('<h2 style="color:red;">Неверный e-mail или пароль</h2>');
    }

    res.send(`<h2>Добро пожаловать, ${user.username}!</h2>`);
});

module.exports = router;



/*
const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('./User');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vhod_account.html'));
});

router.post('/', async (req, res) => {  
    const { email_login, password_login } = req.body;
    
    try {
        const user = await User.findOne({ email: email_login });

        if (!user) {
            return res.send('<h2 style="color:red;">Неверный e-mail или пароль</h2>');
        }
        if (user.password !== password_login) {
            return res.send('<h2 style="color:red;">Неверный e-mail или пароль</h2>');
        }
        res.send(`<h2>Добро пожаловать, ${user.username}!</h2>`);
    } catch (err) {
        console.error(err);
        res.send('<h2 style="color:red;">Ошибка при входе</h2>');
    }
});

module.exports = router;
*/