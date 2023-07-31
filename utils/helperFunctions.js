const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Coltan = require('../models/coltanEntryModel');
const Mixed = require('../models/mixedMineralsModel');
const Wolframite = require('../models/wolframiteEntryModel');
const AppError = require('./appError');

exports.getModel = (model) => {
    const GeneralEntry = require('../models/generalEntryModel');
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
        // 1                // 2        ....n
// ((quantity * grade) + (quantity * grade))/ total quantity

const storekeeper = {
    entry: {
        view: true,
        create: true,
        edit: false,
        delete: false
    },
    suppliers: {
        view: true,
        edit: true,
        create: true,
        delete: false
    },
    buyers: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
    payments: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
    shipments: {
        view: false,
        create: false,
        edit: false,
        delete: false
    }
}

const traceabilityOfficer = {
    entry: {
        view: true,
        create: false,
        edit: true,
        delete: false
    },
    suppliers: {
        view: true,
        edit: true,
        create: true,
        delete: false
    },
    buyers: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
    payments: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
    shipments: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
    contracts: {
        view: true,
        create: false,
        delete: false
    },
}

const managingDirector = {
    entry: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    suppliers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    payments: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    shipments: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: false,
        delete: false
    },
    settings: {
        view: false,
        edit: false
    }
}

const ceo = {
    entry: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    suppliers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    payments: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    shipments: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: false,
        delete: false
    },
    settings: {
        view: true,
        edit: true
    }
}

const operationsManager = {
    entry: {
        view: true,
        create: false,
        edit: true,
        delete: false
    },
    suppliers: {
        view: true,
        create: false,
        edit: true,
        delete: false
    },
    buyers: {
        view: true,
        create: false,
        edit: false,
        delete: false
    },
    payments: {
        view: true,
        create: false,
        edit: false,
        delete: false
    },
    shipments: {
        view: true,
        create: true,
        edit: true,
        delete: false
    },
    contracts: {
        view: false,
        create: false,
        delete: false
    },
    settings: {
        view: false,
        edit: false
    }
}

const accountant = {
    entry: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    suppliers: {
        view: true,
        create: false,
        edit: false,
        delete: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: false
    },
    payments: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    shipments: {
        view: true,
        create: false,
        edit: false,
        delete: false
    },
    contracts: {
        view: true,
        create: false,
        delete: false
    },
    settings: {
        view: false,
        edit: false
    }
}

exports.permissions = {
    storekeeper,
    traceabilityOfficer,
    managingDirector,
    operationsManager,
    ceo,
    accountant
}