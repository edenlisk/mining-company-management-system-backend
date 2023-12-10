const docx2html = require('docx2html');
const AppError = require('../utils/appError');
const HtmlDocx = require('html-docx-js');
const fs = require('fs');
const imagekit = require('../utils/imagekit');
const cheerio = require('cheerio');
const HTMLParser = require('node-html-parser');
const mammoth = require('mammoth');
// const { uploadFileImageKit, deleteFileImageKit } = require('../utils/helperFunctions');

// folder: `/dd_reports/${year}/${month}`,
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

const deleteFileImageKit = async (fileId) => {
    const response = await imagekit.deleteFile(fileId);
    if (response) {
        return !!response;
    }
}

// const HTMLtoDOCX = require('html-to-docx');

exports.convertDocx2Html = async (url, res, next) => {
    const response = await fetch(url);
    let mammothBuffer;
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(`${__dirname}/../temp.docx`, Buffer.from(buffer));
        // fs.readFileSync(`${__dirname}/../temp.docx`, 'utf-8');
        mammothBuffer = await mammoth.convertToHtml({ path: `${__dirname}/../temp.docx` }, {});
        return mammothBuffer.value;
    }
    // const file = fs.readFileSync(`${__dirname}/../temp.docx`);
    // console.log("weeeeee");
    const html = await docx2html(file, { container: 'div' });
    // const result = await mammoth.convertToHtml({ path: `${__dirname}/../public/data/templates/lab report.docx` });
    // return result.value;
    // const htmlContent = html.content;
    // const rootElement = htmlContent.body;
    // if (!rootElement) return next(new AppError("Error in converting docx to html, please try again", 400));
    // fs.unlink(`${__dirname}/../temp.docx`, (err) => {
    //     if (err) {
    //         console.log(err.message);
    //     } else {
    //         console.log("file deleted successfully from file system");
    //     }
    // })
    // return rootElement.innerHTML;
}

exports.convertHtml2Docx = async (fileId, path, htmlContent) => {
    // const html = fs.readFileSync(`${__dirname}/../sample.html`, 'utf-8');
    const header = "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "<head>\n" +
        "  <meta charset=\"UTF-8\" />\n" +
        "  <title>Document</title>\n" +
        "</head>\n" +
        "<body>"
    const footer = "</body></html>"
    // const html = header + htmlContent + footer;
    // const html = cheerio.load(htmlContent);
    // const parsed = HTMLParser.parse(htmlContent);
    const tableStyles = '<table border="2px" style="border-collapse:collapse"';
    const parsedHtml = header + htmlContent.toString().replace(/&lt;/g, '<').replace(/<table/g, tableStyles).replace(/<td/g, '<td style="border: 1px solid;"') + footer;
    // fs.writeFileSync(`${__dirname}/../sample2.html`, parsedHtml)
    // const savedFile = fs.readFileSync("sample2.html", 'utf-8');
    const docx = await HtmlDocx.asBlob(parsedHtml);
    const arrayBuffer = await docx.arrayBuffer();

    // Use fs.writeFile to save the Blob content to the file
    const buffer = Buffer.from(arrayBuffer);
    // await deleteFileImageKit(fileId);
    const fileName = path.split('/').pop();
    const rawPath = path.split('/');
    const filePath = rawPath.slice(0, -1).join('/');
    const response = await uploadFileImageKit(buffer, fileName, filePath);
    fs.writeFileSync(`${__dirname}/../${fileName}.docx`, buffer);
    if (response) {
        return response;
    }

}



