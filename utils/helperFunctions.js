const path = require('path');
const fs = require('fs');
const multer = require('multer');
const imagekit = require('./imagekit');
const Supplier = require('../models/supplierModel');
const Coltan = require('../models/coltanEntryModel');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Wolframite = require('../models/wolframiteEntryModel');
const Beryllium = require('../models/berylliumEntryModel');
const Lithium = require('../models/lithiumEntryModel');
const Tag = require('../models/tagsModel');
const AppError = require('./appError');
const catchAsync = require('./catchAsync');


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
            if (item.cumulativeAmount <= 0 && item.status !== "non-sell agreement") item.status = "sold out";
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
        delete: true
    },
    suppliers: {
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
    }
}

const traceabilityOfficer = {
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
    }
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
    }
}

const operationsManager = {
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
    }
}

const labTechnician = {
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
    mineralGrade: {
        view: true,
        create: true,
        edit: true,
    },
    pricePerUnit: {
        view: true,
        create: true,
        edit: true,
    },
    mineralPrice: {
        view: true,
        create: true,
        edit: true,
    },
    gradeImg: {
        view: true,
        create: true,
        edit: true,
    },
    tantal: {
        view: true,
        create: true,
        edit: true,
    },
    londonMetalExchange: {
        view: true,
        create: true,
        edit: true,
    },
    treatmentCharges: {
        view: true,
        create: true,
        edit: true
    },
    metricTonUnit: {
        view: true,
        create: true,
        edit: true
    },
    USDRate: {
        view: true,
        create: true,
        edit: true,
    },
    rmaFee:{
        view: true,
        add: true,
        edit: true
    },
    paymentHistory: {
        view: true,
        create: true,
        edit: true
    },
    settings: {
        view: false,
        edit: false
    },
    buyers: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    users: {
        view: true,
        create: true,
        edit: true,
        delete: true
    },
    contracts: {
        view: true,
        create: true,
        delete: false
    },
    editRequests: {
        view: true,
        authorize: true,
        reject: true
    },
}

exports.permissions = {
    storekeeper,
    traceabilityOfficer,
    managingDirector,
    operationsManager,
    ceo,
    accountant,
    labTechnician
}

const specialStrings = ["TINNumber", "rmaFee", "USDRate", "rmaFeeUSD"];


exports.toCamelCase = str => {
    if (specialStrings.includes(str)) return str;
    return str.split(' ').map((word, index) => {
        if (index === 0) {
            return word.toLowerCase();
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }).join('');
}

exports.toInitialCase = str => {
    if (specialStrings.includes(str)) return str;
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, function (str) {
            return str.toUpperCase();
        });
}

exports.updateMineTags = async (mineTags, entry) => {
    for (const tag of mineTags) {
        const existingTag = await Tag.findOne({tagNumber: tag.tagNumber, tagType: "mine", entryId: entry._id});
        if (!existingTag) {
            const newTag = await Tag.create(
                {
                    tagNumber: tag.tagNumber,
                    tagType: "mine",
                    weight: Number(tag.weight),
                    sheetNumber: tag.sheetNumber,
                    // status: tag.status,
                    entryId: entry._id,
                }
            )
            if (newTag) {
                entry.mineTags.push(newTag._id);
            }
        } else {
            if (existingTag.tagNumber !== tag.tagNumber) existingTag.tagNumber = tag.tagNumber;
            if (existingTag.weight !== tag.weight) existingTag.weight = tag.weight;
            if (existingTag.sheetNumber !== tag.sheetNumber) existingTag.sheetNumber = tag.sheetNumber;
            // if (existingTag.status !== tag.status) existingTag.status = tag.status;
            await existingTag.save({validateModifiedOnly: true});
        }
    }
}

exports.updateNegociantTags = async (negociantTags, entry) => {
    for (const tag of negociantTags) {
        if (tag.tagNumber === '') continue;
        const existingTag = await Tag.findOne({tagNumber: tag.tagNumber, tagType: "negociant", entryId: entry._id});
        if (!existingTag) {
            const newTag = await Tag.create(
                {
                    tagNumber: tag.tagNumber,
                    tagType: "negociant",
                    weight: tag.weight,
                    sheetNumber: tag.sheetNumber,
                    // status: tag.status,
                    entryId: entry._id,
                }
            )
            if (newTag) entry.negociantTags.push(newTag._id);
        } else {
            if (existingTag.tagNumber !== tag.tagNumber) existingTag.tagNumber = tag.tagNumber;
            if (existingTag.weight !== tag.weight) existingTag.weight = tag.weight;
            if (existingTag.sheetNumber !== tag.sheetNumber) existingTag.sheetNumber = tag.sheetNumber;
            // if (existingTag.status !== tag.status) existingTag.status = tag.status;
            await existingTag.save({validateModifiedOnly: true});
        }
    }
}

exports.getModelAcronym = (model) => {
    if (model.toLowerCase() === "cassiterite") return "SNO2";
    if (model.toLowerCase() === "coltan") return "TA2O5";
    if (model.toLowerCase() === "wolframite") return "WO3";
    if (model.toLowerCase() === "mixed") return "MIXED";
    if (model.toLowerCase() === "lithium") return "LITHIUM";
    if (model.toLowerCase() === "beryllium") return "BERYLLIUM";
}
