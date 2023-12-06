const docx2html = require('docx2html');
const fs = require('fs');
exports.convertDocx2Html = async (url, res) => {
    const response = await fetch(url);
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(`${__dirname}/../temp.docx`, Buffer.from(buffer));
    }
    const file = fs.readFileSync(`${__dirname}/../temp.docx`);
    const html = await docx2html(file)
    const htmlContent = html.content;
    const rootElement = htmlContent.body;
    if (rootElement) {
        fs.unlink(`${__dirname}/../temp.docx`, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("file deleted successfully from file system");
            }
        })
        res
            .status(200)
            .json(
                {
                    status: "Success",
                    htmlString: rootElement.innerHTML
                }
            )
        ;
    }
}





