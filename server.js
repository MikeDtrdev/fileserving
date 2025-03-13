const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 3000;


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Ensure the folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


app.use(express.static(path.join(__dirname, 'public')));


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File uploaded successfully: <a href="/uploads/${req.file.filename}">${req.file.filename}</a>`);
});


app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('<h1>404 - File Not Found</h1>');
        }
        res.sendFile(filePath);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
