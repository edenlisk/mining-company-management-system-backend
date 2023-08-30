const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs/promises');
const path = require('path');
async function getFileStructure(directory) {
    const files = await fs.readdir(directory);

    const fileStructure = [];

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            const subFiles = await getFileStructure(filePath);
            fileStructure.push({ type: 'directory', name: file, content: subFiles });
        } else {
            fileStructure.push({ type: 'file', name: file });
        }
    }

    return fileStructure;
}


exports.getFileStructure = catchAsync(async (req, res, next) => {
    const files = await getFileStructure(path.join(__dirname, "..", 'public', "data"));
    console.log(files);
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
