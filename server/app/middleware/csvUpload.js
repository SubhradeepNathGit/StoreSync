const multer = require("multer");
const path = require("path");
const fs = require("fs");


const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv") || file.originalname.endsWith(".csv")) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only CSV files."), false);
    }
};

const uploadCsv = multer({
    storage: storage,
    fileFilter: csvFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

module.exports = uploadCsv;
