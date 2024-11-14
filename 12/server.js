import express from 'express';
import fileUpload from 'express-fileupload';
import mime from 'mime-types';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('Файл не найден');
    }

    const file = req.files.file;
    const mimeType = mime.lookup(file.name);
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return res.status(400).send('Недопустимый тип файла');
    }

    if (file.size > MAX_FILE_SIZE) {
        return res.status(400).send('Размер файла превышает допустимый лимит');
    }

    const uploadPath = path.join(uploadDir, file.name);
    file.mv(uploadPath, (err) => {
        if (err) {
            console.error('Ошибка при сохранении файла:', err);
            return res.status(500).send('Ошибка при сохранении файла');
        }
        res.send('Файл успешно загружен');
    });
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
