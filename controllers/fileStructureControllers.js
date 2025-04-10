const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs/promises');
const path = require('path');
const fileSystem = require('fs');
const { promisify } = require('util');
const docxConverter = require('docx-pdf');
const imagekit = require('../utils/imagekit');
const multer = require("multer");
const {getSFDT} = require("../utils/helperFunctions");

const deleteFileImageKit = async (fileId) => {
    const response = await imagekit.deleteFile(fileId);
    if (response) {
        return !!response;
    }
}
const uploadFileImageKit = async (file, fileName, folder) => {
    const response = imagekit.upload(
        {
            file,
            fileName,
            folder
        }
    );
    if (response) {
        return response;
    }
}

async function getImageKitFileStructure(directory="/") {
    const fileList = await imagekit.listFiles({ path: directory, includeFolder: true });
    if (fileList?.length === 0) return [];

    const fileStructure = [];

    for (const file of fileList) {
        const item = {
            type: file.type,
            name: file.name,
            url: file.url,
            fileId: file.fileId,
            filePath: file.filePath,
        };

        if (file.type && file.type === 'folder') {
            item.filePath = file.folderPath;
            item.fileId = file.folderId;
            // const subDirectory = path.join(directory, file.name);
            item.content = []
        }

        fileStructure.push(item);
    }

    return fileStructure;
}


exports.getFileStructure = catchAsync(async (req, res, next) => {
    // const files = await getFileStructure(path.join(__dirname, "..", 'public', "data"), "");
    const { directory } = req.body;
    const files = await getImageKitFileStructure(directory);
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    files
                }
            }
        )
    ;
})


exports.downloadFile = catchAsync(async (req, res, next) => {
    if (fileSystem.existsSync(req.body.fullPath)) {
        const ext = path.extname(req.body.filename);
        let contentType = 'application/octet-stream'; // Default content type
        if (ext === 'docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        res.setHeader('Content-Type', contentType);
        const fileStream = fileSystem.createReadStream(req.body.filePath);
        fileStream.pipe(res);
    } else {
        return next(new AppError(`File requested doesn't exist!`, 400));
    }
})


exports.saveFile = catchAsync(async (req, res, next) => {
    const { fileId, filePath } = req.body;
    if (fileId) await deleteFileImageKit(fileId);
    const newPath = filePath?.split("/").slice(0, -1).join('/') || "/"
    const file = fileSystem.readFileSync(req.file.path);
    const response = await uploadFileImageKit(
        file,
        filePath?.split('/').pop().replace(/\.docx[^_]*\.docx/, '.docx') || req.file.originalname,
        newPath
    );
    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('File removed');
        }
    })
    if (!response) return next(new AppError(`Error while saving file!`, 400));
    res
        .status(202)
        .json(
            {
                status: "Success",
                data: {
                    url: response.url,
                    filedId: response.fileId,
                    filePath: response.filePath,
                }
            }
        )
    ;
})

exports.convertToSFDT = catchAsync(async (req, res, next) => {
    const fs = require('fs');
    const FormData = require('form-data');
    const axios = require('axios');
    const filePath = 'sampletest.docx';
    const response = await fetch(req.body.url);
    if (!response.ok) return next(new AppError(`Error while converting to SFDT!`, 400));
    // Replace with the actual file path
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await getSFDT(buffer, res, next);
    // const fileData = fs.readFileSync(filePath);
})

exports.convertToWord = catchAsync(async (req, res, next) => {
    const fs = require('fs');
    const axios = require('axios');
    const formObject = {};
    formObject.FileName = req.body.FileName;
    formObject.Content = req.body.Content;
    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
    };
    axios.post('https://services.syncfusion.com/js/production/api/documenteditor/ExportSFDT', JSON.stringify(formObject), {
        headers, responseType: 'arraybuffer'
    })
        .then((response) => {
            fs.writeFileSync('sample.docx', response.data);
        })
        .catch((error) => {
            console.error('Error:', error.message); // Handle any errors
        });
})


const multerStorage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/../public/data/temp`);
        },
        filename: function (req, file, cb) {
            cb(null, `${file.originalname}.docx`);
        }
    }
)

const multerFilter = (req, file, cb) => {
    cb(null, true);
}

const upload = multer(
    {
        storage: multerStorage,
        fileFilter: multerFilter
    }
)

exports.uploadEditedFile = upload;
