const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const fs = require('fs');

let users = [];
try { users = JSON.parse(fs.readFileSync('users.json')); } catch { users = []; }
let events = [];
try { events = JSON.parse(fs.readFileSync('events.json')); } catch { events = []; }
function saveUsers() {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function saveEvents() {
  fs.writeFileSync('events.json', JSON.stringify(events, null, 2));
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

try {
  events = JSON.parse(fs.readFileSync('events.json'));
} catch (err) {
  console.error('Error reading events file:', err);
  events = [];
}


app.post('/updateEvent', (req, res) => {
  const { id, title } = req.body;

  const event = events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Событие не найдено' });
  }

  event.title = title;
  saveEvents();
  res.json({ success: true, message: 'Событие обновлено' });
});



app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Main_Update.html'));
});

app.get('/Create_account.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Create_account.html'));
});

app.get('/Vhod_account.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vhod_account.html'));
});

function generateRecoveryCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

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

    users.push({ email, password, username, phone, age, gender, recoveryCode, role: 'participant' });


    res.send(`
        <h2>Регистрация успешна!</h2>
        <p>Ваш код восстановления пароля: <strong>${recoveryCode}</strong></p>
        <a href="/Vhod_account.html">Войти</a>
    `);
});



app.post('/Vhod_acc', (req, res) => {
    const { email_login, password_login } = req.body;
    const user = users.find(u => u.email === email_login && u.password === password_login);

    if (!user) {
        return res.send('<h2 style="color:red;">Неверный e-mail или пароль</h2>');
    }


    res.send(`
  <script>
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify({
      username: "${user.username}",
      email: "${user.email}",
      phone: "${user.phone}",
      age: "${user.age}",
      gender: "${user.gender}",
      role: "${user.role || 'participant'}"
    }));
    localStorage.setItem('userRole', "${user.role || 'participant'}");
    window.location.href = '/Main_Update.html';
  </script>
`);
});

app.post('/recover_password', (req, res) => {
    const { email, code } = req.body;
    const user = users.find(u => u.email === email && u.recoveryCode === code);

    if (!user) {
        return res.send('<h2 style="color:red;">Неверный e-mail или код</h2>');
    }

    res.send(`<h2>Ваш пароль: <b>${user.password}</b></h2><a href="/Vhod_account.html">Войти</a>`);
});


app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});

app.post('/changeRole', (req, res) => {
  const { email, role } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    user.role = role;
    saveUsers();
    res.json({ success: true, message: "Роль успешно изменена" });
  } else {
    res.status(404).json({ success: false, message: "Пользователь не найден" });
  }
});


app.get('/getUsers', (req, res) => {
  res.json(users);
});

const crypto = require('crypto');

app.post('/addEvent', (req, res) => {
  const { title, date, time, location, organization } = req.body;

  if (!title || !date || !time || !location || !organization) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }

  const event = {
    id: crypto.randomUUID(),
    title,
    date,
    time,
    location,
    organization,
    participants: []
  };

  events.push(event);
  saveEvents();
  res.json({ success: true, event });
});

app.post('/editEvent', (req, res) => {
  const { id, title, date, time, location, organization } = req.body;

  const event = events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Событие не найдено' });
  }

  event.title = title;
  event.date = date;
  event.time = time;
  event.location = location;
  event.organization = organization;

  saveEvents();
  res.json({ success: true, message: 'Событие обновлено' });
});


app.get('/getEvents', (req, res) => {
  res.json(events);
});

  app.post('/changeRole', (req, res) => {
  const { email, role } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    user.role = role;
    saveUsers();
  }
  res.sendStatus(200);
});

app.post('/updateProfile', (req, res) => {
  const { email, recoveryCode, newName, newPhone, newAge, newGender, newPassword } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.json({ success: false, message: "Пользователь не найден" });
  }

  if (user.recoveryCode !== recoveryCode) {
    return res.json({ success: false, message: "Неверный рекавери-код" });
  }

  if (newName) user.username = newName;
  if (newPhone) user.phone = newPhone;
  if (newAge) user.age = newAge;
  if (newGender) user.gender = newGender;
  if (newPassword) user.password = newPassword;

  saveUsers();

  res.json({ success: true });
});


app.post('/toggleParticipation', (req, res) => {
  const { eventId, username, join } = req.body;

  const event = events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Событие не найдено' });
  }

  if (!event.participants) event.participants = [];

  if (join) {
    if (!event.participants.includes(username)) {
      event.participants.push(username);
    }
  } else {
    event.participants = event.participants.filter(name => name !== username);
  }

  saveEvents();
  res.json({ success: true, message: 'Участие обновлено' });
});

app.post('/deleteEvent', (req, res) => {
  const { id } = req.body;
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Событие не найдено' });
  }

  events.splice(index, 1);
  saveEvents();
  res.json({ success: true, message: 'Событие удалено' });
});

app.post('/getNotifications', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Не указано имя пользователя' });
  }

  const now = new Date();
  const notifications = [];

  events.forEach(event => {
    if (event.participants && event.participants.includes(username)) {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const timeDiff = eventDateTime - now;
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        notifications.push({
          type: 'upcoming',
          message: `Скоро начнется мероприятие: "${event.title}" — ${event.date} в ${event.time}`
        });
      }
    }
  });

  res.json({ success: true, notifications });
});

/*
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');  
const vhodRoute = require('./Vhod_acc');
const registerRoute = require('./Create_acc');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/yourdbname')
    .then(() => console.log('Подключение к базе данных MongoDB успешно!'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));
//mongoose.connect('mongodb://localhost:27017/yourdbname', {
    //useNewUrlParser: true,
    //useUnifiedTopology: true
//})
//.then(() => console.log('Подключение к базе данных MongoDB успешно!'))
//.catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Main.html'));
});

app.get('/Vhod_account.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vhod_account.html'));
});

app.use('/vhod_acc', vhodRoute);
app.use('/create_acc', registerRoute);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
*/
