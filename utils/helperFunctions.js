const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Supplier = require('../models/supplierModel');
const Coltan = require('../models/coltanEntryModel');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Wolframite = require('../models/wolframiteEntryModel');
const Beryllium = require('../models/berylliumEntryModel');
const Lithium = require('../models/lithiumEntryModel');
const AppError = require('./appError');

exports.getModel = (model) => {
    switch (model) {
        case "coltan":
            return Coltan;
        case "cassiterite":
            return Cassiterite;
        case "wolframite":
            return Wolframite;
        case "beryllium":
            return Beryllium;
        case "lithium":
            return Lithium
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

exports.fonts = {
    Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
    },
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
    },
    Symbol: {
        normal: 'Symbol'
    },
    ZapfDingbats: {
        normal: 'ZapfDingbats'
    }
};

exports.getSixMonthsAgo = endMonth => {
    const currentDate = new Date();
    const specifiedMonth = new Date(
        currentDate.getFullYear(),
        endMonth ? endMonth - 1 : currentDate.getMonth()
    );
    const sixMonthsAgo = new Date(specifiedMonth);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return {specifiedMonth, sixMonthsAgo};
}

exports.handlePaidSpecific = output => {
    for (const item of output) {
        if (item.unpaid) {
            if (item.unpaid <= 0) item.settled = true;
        }
    }
}

exports.handleChangeSupplier = async (docObject, next) => {
    if (docObject.isModified('supplierId') && !docObject.isNew) {
        const supplier = await Supplier.findById(this.supplierId);
        if (!supplier) return next(new AppError("The Selected supplier no longer exists!", 400));
        this.companyName = supplier.companyName;
        this.licenseNumber = supplier.licenseNumber;
        this.representativeId = supplier.representativeId;
        this.representativePhoneNumber = supplier.representativePhoneNumber;
        this.companyRepresentative = supplier.companyRepresentative;
        this.TINNumber = supplier.TINNumber;
        this.district = supplier.address.district;
    }
}

exports.getMonthWords = monthNumber => {
    switch (monthNumber + 1) {
        case 1:
            return "January"
        case 2:
            return "February"
        case 3:
            return "March"
        case 4:
            return "April"
        case 5:
            return "May"
        case 6:
            return "June"
        case 7:
            return "July"
        case 8:
            return "August"
        case 9:
            return "September"
        case 10:
            return "October"
        case 11:
            return "November"
        case 12:
            return "December"
        default:
            return "Unclassified"
    }
}

exports.handleConvertToUSD = (amount, USDRate) => {
    return amount / USDRate;
}

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
        edit: true,
        delete: false
    },
    suppliers: {
        view: true,
        create: true,
        edit: true,
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
        view: false,
        create: false,
        delete: false
    },
    settings: {
        view: false,
        edit: false
    },
    users: {
        view: false,
        create: false,
        edit: false,
        delete: false
    },
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
        create: true,
        edit: true,
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
        view: false,
        create: false,
        delete: false
    },
    settings: {
        view: false,
        edit: false
    },
    users: {
        view: false,
        create: false,
        edit: false,
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
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
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
        create: true,
        delete: true
    },
    settings: {
        view: true,
        edit: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
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
    },
    users: {
        view: false,
        create: false,
        edit: false,
        delete: false
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
    },
    users: {
        view: false,
        create: false,
        edit: false,
        delete: false
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