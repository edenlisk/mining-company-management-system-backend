const PizZip = require("pizzip");
const mongoose = require('mongoose');
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const Supplier = require('../models/supplierModel');
const { getModel, getMonthWords, getSixMonthsAgo } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const populateSitesCoordinates = (minesites) => {
    let sites_coordinates = "";
    minesites.forEach(site => {
        sites_coordinates += `${site.name} \n Latitude: ${site.coordinates.lat}. \n Longitude: ${site.coordinates.long}. \n`;
    })
    return sites_coordinates;
}

const populateSitesNames = (minesites) => {
    let sites_names = "";
    minesites.forEach(site => {
        sites_names += `${site.name} \n`;
    })
    return sites_names;
}

const populateSiteCodes = (minesites) => {
    let site_codes = "";
    minesites.forEach(site => {
        site_codes += `${site.code} \n`;
    })
    return site_codes;
}

const getProduction = async (model, supplierId, endMonth) => {
    const {specifiedMonth, sixMonthsAgo} = getSixMonthsAgo(endMonth);
    const Entry = getModel(model.toLowerCase());
    const supplierOverallProduction = await Entry.aggregate(
        [
            {
                $match: {
                    supplierId: new mongoose.Types.ObjectId(supplierId),
                    supplyDate: {
                        $lte: specifiedMonth, // Last day of the specified month
                        $gt: sixMonthsAgo // Six months ago from the specified month
                    },
                }
            },
            {
                $project: {
                    month: { $month: '$supplyDate' },
                    year: { $year: '$supplyDate' },
                    weightIn: 1,
                },
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    totalWeightIn: { $sum: '$weightIn' },
                },
            }
        ]
    )
    const monthMap = {};
    let currentDate = new Date(sixMonthsAgo);
    while (currentDate < specifiedMonth) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Adjusting for 0-based index
        monthMap[`${currentYear}-${currentMonth}`] = 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Populate the object with matching results
    supplierOverallProduction.forEach(result => {
        const { year, month } = result._id;
        monthMap[`${year}-${month}`] = result.totalWeightIn;
    });

    // Convert the object back to an array
    return Object.keys(monthMap).map(key => ({
        _id: {year: parseInt(key.split('-')[0]), month: parseInt(key.split('-')[1])},
        totalWeightIn: monthMap[key],
    }));
}

exports.generate = catchAsync(async (req, res, next) => {
    // Load the docx file as binary content
    const content = fs.readFileSync(
        path.resolve(`${__dirname}/../`, "dd template.docx"),
        "binary"
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    const supplier = await Supplier.findById(req.body.supplierId);
    const models = ["cassiterite", "coltan", "wolframite"];
    const mineralTypes = {
        "mineral_type1": "cassiterite",
        "mineral_type2": "coltan",
        "mineral_type3": "wolframite",
        "mineral_type4": "mixed"
    }
    const sampleObject = {};
    for (const model of models) {
        const mineralProduction = await getProduction(model, req.body.supplierId);
        for (const production of mineralProduction) {
            sampleObject[`month_${mineralProduction.indexOf(production) + 1}`] = getMonthWords(production._id.month);
            sampleObject[`mineral_type${models.indexOf(model) + 1}`] = mineralTypes[`mineral_type${models.indexOf(model) + 1}`];
            sampleObject[`month${mineralProduction.indexOf(production) + 1}_type${models.indexOf(model) + 1}`] = production.totalWeightIn;
        }
    }


    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)

    const buffer = doc.render({
        sites_coordinates: populateSitesCoordinates(supplier.mineSites),
        name_of_sites: populateSitesNames(supplier.mineSites),
        code_of_sites: populateSiteCodes(supplier.mineSites),
        ...req.body,
        sites_district: supplier.address.district,
        sites_sector: supplier.address.sector,
        // TODO 15: USE SECTOR INSTEAD OF SECTOR
        sites_cell: supplier.address.sector,
        ...sampleObject
        // name_of_processor: this.docInfo.name_of_processor,
        // name_of_consultant: this.docInfo.name_of_consultant,
        // email_of_consultant: this.docInfo.email_of_consultant,
        // is_person_trained: this.docInfo.is_person_trained,
        // when_training: this.docInfo.when_training,
        // purpose_of_visit: this.docInfo.purpose_of_visit,
        // company_visited: this.docInfo.company_visited,
        // company_license_number: this.docInfo.company_license_number,
        // number_of_minesites: this.docInfo.number_of_minesites,
        // number_of_minesites_visited: this.docInfo.number_of_minesites_visited,
        // sites_visited: this.docInfo.sites_visited,
        // date_of_report: this.docInfo.date_of_report,
        // date_of_last_visit: this.docInfo.date_of_last_visit,
        // list_of_person_interviewed_and_role: this.docInfo.list_of_person_interviewed_and_role,
        // name_of_sites: this.docInfo.name_of_sites,
        // code_of_sites: this.docInfo.code_of_sites,
        // sites_district: this.docInfo.sites_district,
        // sites_sector: this.docInfo.sites_sector,
        // sites_cell: this.docInfo.sites_cell,
        // date_of_visit: this.docInfo.date_of_visit,
        // time_of_visit: this.docInfo.time_of_visit,
        // sites_coordinates: this.docInfo.sites_coordinates,
        // rmb_agent_present: this.docInfo.rmb_agent_present,
        // rmb_agent_name: this.docInfo.rmb_agent_name,
        // name_position_of_company_representative: this.docInfo.name_position_of_company_representative,
        // number_of_diggers_observations: this.docInfo.number_of_diggers_observations,
        // number_of_diggers_representative: this.docInfo.number_of_diggers_representative,
        // number_of_washers_observations: this.docInfo.number_of_washers_observations,
        // number_of_washers_representative: this.docInfo.number_of_washers_representative,
        // number_of_transporters_observations: this.docInfo.number_of_transporters_observations,
        // number_of_transporters_representative: this.docInfo.number_of_transporters_representative,
        // number_of_teams_observations: this.docInfo.number_of_teams_observations,
        // number_of_persons_per_team_observations: this.docInfo.number_of_persons_per_team_observations,
        // number_of_washers_per_team_observations: this.docInfo.number_of_washers_per_team_observations,
        // number_of_transporters_per_team_observations: this.docInfo.number_of_transporters_per_team_observations,
    }).getZip().generate({type: "nodebuffer", compression: "DEFLATE",})

    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', `attachment; filename="amarongi-risk-assessment.docx"`);
    // res.send(buf);
    // buf is a nodejs Buffer, you can either write it to a
    // file or res.send it with express for example.

    // const cassiteriteProduction = await getProduction("cassiterite", req.params.supplierId);
    // for (const item of cassiteriteProduction) {
    //     console.log(item);
    // }




    const year = (new Date()).getFullYear();
    const month = getMonthWords((new Date()).getMonth());
    const filePath = `${__dirname}/../public/data/DD Reports/${year}/${month}`;
    if (!fs.existsSync(filePath)) {
        fs.mkdir(filePath, {recursive: true}, err => {
            if (err) {
                console.log(err);
            }
        });
    }
    fs.writeFileSync(path.resolve(filePath, `${req.body.date_of_report} iTSCi Template Due Diligence ${req.body.company_visited}.docx`), buffer);
    res
        .status(200)
        .json(
            {
                status: "Success",
            }
        )
    ;
})



// const document = {
//     "_id": "64c3db8965366b8b6d3cf3b1",
//     "companyName": "KOPEMINYA",
//     "TINNumber": "741233",
//     "licenseNumber": "RW/JAN2003/11",
//     "email": "kopeminya@gmail.com",
//     "nationalId": "",
//     "phoneNumber": "250785468686",
//     "address": {
//         "province": "South",
//         "district": "Nyamagabe",
//         "sector": "Kigeme"
//     },
//     "mineSites": [
//         {
//             "name": "Kigeme",
//             "code": "441",
//             "coordinates": {
//                 "lat": "-25545",
//                 "long": "32555"
//             },
//             "_id": {
//                 "$oid": "64c3db8965366b8b6d3cf3b2"
//             }
//         }
//     ],
//     "numberOfDiggers": 20,
//     "numberOfWashers": 30,
//     "numberOfTransporters": 10,
//     "typeOfMinerals": [
//         "wolframite"
//     ],
//     "observations": [],
//     "createdAt": {
//         "$date": "2023-07-28T15:15:21.861Z"
//     },
//     "updatedAt": {
//         "$date": "2023-07-28T15:16:00.978Z"
//     },
//     "__v": 0
// }
//
// class DocTemplater {
//     constructor(supplier, docInfo) {
//         this.supplier = supplier;
//         this.docInfo = docInfo;
//         this.content = fs.readFileSync(
//             path.resolve(`${__dirname}/../`, "dd template.docx"),
//             "binary"
//         );
//         this.doc = null;
//     }
//
//     createDoc() {
//         const zip = new PizZip(this.content);
//         this.doc = new Docxtemplater(zip, {
//             paragraphLoop: true,
//             linebreaks: true,
//         });
//     }
//
//
//     populateAndGetBuffer() {
//         const self = this.docInfo;
//         return this.doc.render({
//             ...self,
//             sites_coordinates: populateSitesCoordinates(this.supplier.mineSites),
//             name_of_sites: populateSitesNames(this.supplier.mineSites),
//             code_of_sites: populateSiteCodes(this.supplier.mineSites),
//             // name_of_processor: this.docInfo.name_of_processor,
//             // name_of_consultant: this.docInfo.name_of_consultant,
//             // email_of_consultant: this.docInfo.email_of_consultant,
//             // is_person_trained: this.docInfo.is_person_trained,
//             // when_training: this.docInfo.when_training,
//             // purpose_of_visit: this.docInfo.purpose_of_visit,
//             // company_visited: this.docInfo.company_visited,
//             // company_license_number: this.docInfo.company_license_number,
//             // number_of_minesites: this.docInfo.number_of_minesites,
//             // number_of_minesites_visited: this.docInfo.number_of_minesites_visited,
//             // sites_visited: this.docInfo.sites_visited,
//             // date_of_report: this.docInfo.date_of_report,
//             // date_of_last_visit: this.docInfo.date_of_last_visit,
//             // list_of_person_interviewed_and_role: this.docInfo.list_of_person_interviewed_and_role,
//             // name_of_sites: this.docInfo.name_of_sites,
//             // code_of_sites: this.docInfo.code_of_sites,
//             // sites_district: this.docInfo.sites_district,
//             // sites_sector: this.docInfo.sites_sector,
//             // sites_cell: this.docInfo.sites_cell,
//             // date_of_visit: this.docInfo.date_of_visit,
//             // time_of_visit: this.docInfo.time_of_visit,
//             // sites_coordinates: this.docInfo.sites_coordinates,
//             // rmb_agent_present: this.docInfo.rmb_agent_present,
//             // rmb_agent_name: this.docInfo.rmb_agent_name,
//             // name_position_of_company_representative: this.docInfo.name_position_of_company_representative,
//             // number_of_diggers_observations: this.docInfo.number_of_diggers_observations,
//             // number_of_diggers_representative: this.docInfo.number_of_diggers_representative,
//             // number_of_washers_observations: this.docInfo.number_of_washers_observations,
//             // number_of_washers_representative: this.docInfo.number_of_washers_representative,
//             // number_of_transporters_observations: this.docInfo.number_of_transporters_observations,
//             // number_of_transporters_representative: this.docInfo.number_of_transporters_representative,
//             // number_of_teams_observations: this.docInfo.number_of_teams_observations,
//             // number_of_persons_per_team_observations: this.docInfo.number_of_persons_per_team_observations,
//             // number_of_washers_per_team_observations: this.docInfo.number_of_washers_per_team_observations,
//             // number_of_transporters_per_team_observations: this.docInfo.number_of_transporters_per_team_observations,
//         }).getZip().generate({type: "nodebuffer", compression: "DEFLATE",})
//         // const buf = doc.getZip().generate({
//         //     type: "nodebuffer",
//         //     // compression: DEFLATE adds a compression step.
//         //     // For a 50MB output document, expect 500ms additional CPU time
//         //     compression: "DEFLATE",
//         // });
//     }
//
//     saveFile(buffer) {
//         const year = (new Date()).getFullYear();
//         const month = getMonthWords((new Date()).getMonth());
//         const filePath = `${__dirname}/../public/data/DD Reports/${year}/${month}`;
//         if (!fs.existsSync(filePath)) {
//             fs.mkdir(filePath, {recursive: true}, err => {
//                 if (err) {
//                     console.log(err);
//                 }
//             });
//         }
//         fs.writeFileSync(path.resolve(filePath, `${this.docInfo.date_of_report} iTSCi Template Due Diligence ${this.docInfo.company_visited}.docx`), buffer);
//     }
// }
// const dueDoc = new DocTemplater(document, {name_of_processor: "Trading Services Logistics/ KANZAMIN", name_of_consultant: "Nsanzimfura Venant", company_visited: "DUSUZUMIMIRIMO", date_of_report: "20 August 2023"});
// dueDoc.createDoc();
// dueDoc.saveFile(dueDoc.populateAndGetBuffer());


