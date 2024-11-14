import express from 'express';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/submit', [
    body('name')
        .trim()
        .escape()
        .isLength({ min: 2 }).withMessage('Имя должно быть не менее 2 символов')
        .isAlpha().withMessage('Имя должно содержать только буквы'),
    body('email')
        .isEmail().withMessage('Неверный формат email')
        .normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.send('Ввод успешно проверен и очищен');
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});