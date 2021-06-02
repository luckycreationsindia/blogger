const multer = require("multer");
const imageThumbnail = require('image-thumbnail');
const path = require("path");
const fs = require("fs");
let counter = 100;

const storage = multer.diskStorage(
    {
        destination: defaultConfig.uploadPath,
        fileSize: 10000000,
        filename: function (req, file, cb) {
            if (counter > 1000) counter = 100;
            cb(null, Date.now() + "-" + (counter++) + path.extname(file.originalname));
        }
    }
);

const upload = multer({
    storage: storage,
    fileSize: 10000000
});

module.exports = (app) => {
    app.post(defaultConfig.baseUrlPath + '/upload', authMiddleWare, upload.single('file'), async (req, res) => {
        await generateThumbnail(req.file.path, "_thumb", 200, 200);
        await generateThumbnail(req.file.path, "");
        return res.json({status: 'Success', message: req.file.filename});
    });
    app.use(defaultConfig.baseUrlPath + '/files', (req, res) => {
        let fileName = req.path.replace("/files", "");
        let f = defaultConfig.uploadPath + fileName;
        if (fs.existsSync(f))
            res.sendFile(f);
        else
            res.status(404).json({status: 'Failure', message: "Not Found"});
    });
}

async function generateThumbnail(filePath, fileAppendString = "", width = 1024, height = 768) {
    try {
        const stream = fs.createReadStream(filePath);
        const thumbnail = await imageThumbnail(stream, {width: width, height: height, fit: 'inside', jpegOptions: {quality: 100}});
        let ext = path.extname(filePath);
        let newFilePath = filePath.substr(0, filePath.lastIndexOf('.')) + fileAppendString + ext;
        fs.writeFileSync(newFilePath, thumbnail, {flags: 'w'});
    } catch (e) {
        console.error(e);
    }
}