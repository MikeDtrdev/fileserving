const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow only certain file types
        const filetypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types
        const mimetype = filetypes.test(mime.lookup(file.originalname));
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not allowed!'));
    }
});

const server = http.createServer((req, res) => {
    // Log the incoming request URL
    console.log(`Received request for: ${req.url}`);

    if (req.method === 'POST' && req.url === '/upload') {
        upload.single('file')(req, res, (err) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`<h1>${err.message}</h1>`);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>File uploaded successfully!</h1>');
            }
        });
    } else {
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>', 'utf8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
                res.end(content, 'utf8');
            }
        });
    }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
