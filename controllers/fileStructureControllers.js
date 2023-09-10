const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs/promises');
const path = require('path');
const fileSystem = require('fs');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

async function getFileStructure(directory, relativePath) {
    const files = await fs.readdir(directory);

    const fileStructure = [];

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);


        const item = {
            type: stats.isDirectory() ? 'directory' : 'file',
            name: file,
            fullPath: path.join(relativePath, file), // Add fullPath property
        };
        if (stats.isDirectory()) {
            item.content = await getFileStructure(filePath, item.fullPath);
        }
        fileStructure.push(item);

        // if (stats.isDirectory()) {
        //     const subFiles = await getFileStructure(filePath);
        //     fileStructure.push({ type: 'directory', name: file, content: subFiles, fullPath: path.join(relativePath, file) });
        // } else {
        //     fileStructure.push({ type: 'file', name: file, fullPath: path.join(relativePath, file) });
        // }
    }

    return fileStructure;
}


exports.getFileStructure = catchAsync(async (req, res, next) => {
    const files = await getFileStructure(path.join(__dirname, "..", 'public', "data"), "");
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
    const filePath = `${__dirname}/../public/data/${req.body.fullPath}`;
    // Check if the file exists
    if (fileSystem.existsSync(filePath)) {
        // Set the appropriate headers for the response
        res.setHeader('Content-Disposition', `attachment; filename=${req.body.filename}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); // Set the content type for DOCX files
        // res.setHeader('Content-Type', 'application/octet-stream');

        // Create a read stream from the file and pipe it to the response
        // res.sendFile(filePath);
        const fileStream = fileSystem.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        return next(new AppError(`File requested doesn't exists!`, 400));
    }
})
