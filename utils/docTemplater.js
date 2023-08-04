const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.generate = catchAsync(async (req, res, next) => {
    // Load the docx file as binary content
    const content = fs.readFileSync(
        path.resolve(`${__dirname}/../`, "due-diligence-template.docx"),
        "binary"
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });


    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
    doc.render({
        name_of_processor: "Trading Services Logistics (TSL ltd)/ KANZAMIN",
        name_of_consultant: "Nsanzimfura Venant",
        email_of_consultant: "nsanzivenant@gmail.com",
        date_of_report: "03 August 2023",
        name_of_person_interviewed: "Simon Vincent"
    });

    const buf = doc.getZip().generate({
        type: "nodebuffer",
        // compression: DEFLATE adds a compression step.
        // For a 50MB output document, expect 500ms additional CPU time
        compression: "DEFLATE",
    });

    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', `attachment; filename="amarongi-risk-assessment.docx"`);
    // res.send(buf);
    // buf is a nodejs Buffer, you can either write it to a
    // file or res.send it with express for example.
    fs.writeFileSync(path.resolve(__dirname, "output.docx"), buf);
})


