require('dotenv').config();
const mysql = require('mysql2');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const express = require('express'); 
const app = express();
const port = 3003;

app.options('*', cors());
app.use(cors({
    origin:'https://arhamanand.com', 
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], 
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Content-Disposition', 
        'Accept',
        'Range' 
    ],
    exposedHeaders: [
        'Content-Disposition', 
        'Content-Length',
        'Content-Type'
    ],
    preflightContinue: false, 
    optionsSuccessStatus: 204,
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const privateKey = fs.readFileSync('C:/inetpub/wwwroot/arhamanand.com/certs/api.arhamanand.com-key.pem', 'utf8');
const certificate = fs.readFileSync('C:/inetpub/wwwroot/arhamanand.com/certs/api.arhamanand.com-crt.pem', 'utf8');
const ca = fs.readFileSync('C:/inetpub/wwwroot/arhamanand.com/certs/api.arhamanand.com-chain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: ca };

// const USERS = [
//     { username: process.env.username, password: process.env.password } 
// ];
const USERS = [
    { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, role: process.env.ADMIN_ROLE },
    { username: process.env.STAFF_USERNAME, password: process.env.STAFF_PASSWORD, role: process.env.STAFF_ROLE },
];
console.log('USERS:', USERS);

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestTimeout: 60000,
});
let customCategories = []; 
app.get('/categories', (req, res) => {
    res.json(customCategories);
});
app.post('/add-category', (req, res) => {
    const { category } = req.body;
    if (!category || typeof category !== 'string') {
        return res.status(400).send('Invalid category name');
    }
    if (customCategories.includes(category)) {
        return res.status(400).send('Category already exists');
    }
    customCategories.push(category);
    res.json({ message: 'Category added successfully', category });
});

const upload = multer({ storage: multer.memoryStorage() });

// In-memory metadata store for uploader tracking
const uploadedMetadata = {}; // { 'brand/category/file.jpg': { uploader: 'Anna' } }

const uploadFile = async (filePath, fileContent, mimeType, uploaderName) => {
    console.log("Uploading file:", filePath);
    try {
        const uploadParams = {
            Bucket: "affwlresources",
            Key: filePath,
            Body: fileContent,
            ContentType: mimeType,
            ACL: 'public-read',
            Metadata: {
                uploadername: uploaderName
            }
        };
        
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command, { timeout: 30000 });
        console.log("File uploaded successfully:", filePath);
        return `https://d20h2he2gi3v2g.cloudfront.net/${filePath}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Error uploading file: " + error.message);
    }
};

function sanitize(input) {
    return input?.trim().replace(/[^a-zA-Z0-9-_.]/g, '_') || 'unknown';
}

app.post("/upload", upload.array("files"), async (req, res) => {
    try {
        const { brand, category, uploaderName  } = req.body;
        const files = req.files;

        if (uploaderName == '') {
            return res.status(400).send("Missing uploaderName ");
        }

        if (!files || files.length === 0) {
            return res.status(400).send("No files uploaded");
        }

        let uploadedFiles = [];
        for (let file of files) {
            const filePath = `${sanitize(brand)}/${sanitize(category)}/${file.originalname}`;
            const fileUrl = await uploadFile(filePath, file.buffer, file.mimetype,uploaderName);
            uploadedMetadata[filePath] = {
                uploader: uploaderName
            };
            uploadedFiles.push(fileUrl);
        }

        res.json({ message: "Files uploaded successfully", files: uploadedFiles });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const { HeadObjectCommand } = require("@aws-sdk/client-s3");

app.get('/list-files', async (req, res) => {
    const { brand, category } = req.query;
    const folderPath = `${brand}/${category}/`;
    console.log(`Listing files for ${folderPath} at ${new Date().toISOString()}`);

    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: "affwlresources",
            Prefix: folderPath,
        });
        const data = await s3Client.send(listCommand);

        if (!data.Contents) {
            return res.json([]);
        }

        // For each file, get metadata (uploadername)
        const files = await Promise.all(data.Contents.map(async (item) => {
            const key = item.Key;
            const fileName = key.split('/').pop();

            // Fetch metadata with HeadObjectCommand
            try {
                const headCommand = new HeadObjectCommand({
                    Bucket: "affwlresources",
                    Key: key,
                });
                const headData = await s3Client.send(headCommand);
                const uploader = headData.Metadata?.uploadername || 'Unknown';

                return {
                    key,
                    fileName,
                    url: `https://d20h2he2gi3v2g.cloudfront.net/${key}`,
                    uploader,
                };
            } catch (headErr) {
                console.error("Error fetching metadata for", key, headErr);
                return {
                    key,
                    fileName,
                    url: `https://d20h2he2gi3v2g.cloudfront.net/${key}`,
                    uploader: 'Unknown',
                };
            }
        }));

        res.json(files);
    } catch (err) {
        console.error("Error listing files:", err);
        res.status(500).send("Error listing files");
    }
});



// app.delete('/delete-file', async (req, res) => {
//     const { fileKey } = req.body;
//     console.log(fileKey);
//     if (!fileKey) {
//         return res.status(400).send('Missing fileKey');
//     }

//     try {
//         const params = {
//             Bucket: 'affwlresources',
//             Key: fileKey,
//         };

//         const command = new DeleteObjectCommand(params);
//         await s3Client.send(command, { requestTimeout: 30000 });

//         // Remove from metadata as well
//         delete uploadedMetadata[fileKey];

//         console.log("File deleted successfully:", fileKey);
//         res.status(200).send({ message: 'File deleted successfully' });
//     } catch (err) {
//         console.error("Error deleting file:", err);
//         res.status(500).send('Error deleting file from S3: ' + err.message);
//     }
// });
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, role: user.role, username });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});
app.delete('/delete-file', async (req, res) => {
    const { fileKey, username } = req.body;
    console.log(fileKey, username);
    if (!fileKey || !username) {
        return res.status(400).send('Missing fileKey or username');
    }

    // Verify user role
    const user = USERS.find(u => u.username === username);
    if (!user || user.role !== 'admin') {
        return res.status(403).send('Unauthorized: Only admins can delete files');
    }

    try {
        const params = {
            Bucket: 'affwlresources',
            Key: fileKey,
        };

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command, { requestTimeout: 30000 });

        // Remove from metadata as well
        delete uploadedMetadata[fileKey];

        console.log("File deleted successfully:", fileKey);
        res.status(200).send({ message: 'File deleted successfully' });
    } catch (err) {
        console.error("Error deleting file:", err);
        res.status(500).send('Error deleting file from S3: ' + err.message);
    }
});
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

https.createServer(credentials, app).listen(port, '0.0.0.0', () => {
    console.log(`Server running at https://api.arhamanand.com:${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message });
});

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
