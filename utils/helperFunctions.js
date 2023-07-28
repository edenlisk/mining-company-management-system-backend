const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Coltan = require('../models/coltanEntryModel');
const Mixed = require('../models/mixedMineralsModel');
const Wolframite = require('../models/wolframiteEntryModel');
const GeneralEntry = require('../models/generalEntryModel');
const AppError = require('./appError');

exports.getModel = (model) => {
    switch (model) {
        case "cassiterite":
            return Cassiterite;
        case "coltan":
            return Coltan;
        case "mixed":
            return Mixed;
        case "wolframite":
            return Wolframite;
        case "general":
            return GeneralEntry;
    }
}

const getHeader = (fileName) => {
    const extension = path.extname(fileName);
    switch (extension) {
        case '.doc':
            return 'application/msword';
        case '.docx':
            return 'application/vdn.openxmlformats-officedocument.wordprocessingml.document';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/pdf';
    }
}

exports.multerStorage = (destination, fileName, renameExisting) => multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, destination);
        },
        filename: function (req, file, cb) {
            const extension = path.extname(file.originalname);
            if (renameExisting) {
                const filePath = `${destination}/${fileName ? fileName + extension : file.originalname}`;
                if (fs.existsSync(filePath)) {
                    fs.rename(filePath, `${destination}/ex-${fileName ? fileName + extension : file.originalname}`, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('File renamed successfully');
                    });
                }
            }
            req.targetField = file.fieldname;
            cb(null, fileName ? fileName + extension : file.originalname);
        }
    }
)

exports.multerFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const allowExtension = ['.doc', '.docx', '.pdf'];
    if (allowExtension.includes(fileExtension.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new AppError("Not a .doc, .docx, or .pdf selected", 400), false);
    }
}

exports.validateNumber = (elem) => {
    return elem >= 0
}

exports.sendAttachment = (filePath, fileName, res) => {
    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-Type', getHeader(fileName));
    fileStream.pipe(res);
}