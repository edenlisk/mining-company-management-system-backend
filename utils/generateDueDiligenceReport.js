const officegen = require('officegen');
const fs = require('fs');


const docx = officegen({
    type: 'docx',
    orientation: 'portrait',
    pageMargins: {top: 1000, bottom: 1000, left: 1000, right: 1000}
})

const subTable = [
    {
        type: "text",
        val: `Date of the Report: ${Date.now()}`
    }
]

const firstColumn = [
    {
        type: "text",
        val: "Name of the processor/exporter carrying out the visit: Kanzamin ltd",
        opts: {
            cellColWidth: 4261,
            sz: 22,
            align: 'left',
            fontFamily: 'Arial'
        }
    }
]

const firstTable = [
    [
        {
            type: "table"
        },
        {
            type: "text",
            val: "Name of the person conducting the visit and writing report, contacts (email/phone)," +
                " and role/position within the processor/exporter (consultant or permanent staff?). \n Name: Nsanzimfura Venant \n Email: nsanzivenant@gmail.com \n Did the person receive training/coaching from ITSCI in the past? If yes, indicate when. Yes",
            opts: {
                sz: 22,
                align: 'left',
                fontFamily: 'Arial'
            }
        }
    ]
]


const tableStyle = {
    tableColWidth: 4261,
    tableSize: 24,
    tableColor: 'ada',
    tableAlign: 'center',
    tableFontFamily: 'Comic Sans MS'
}


const data = [
    [
        {
            type: 'table',
            val: firstTable,
            opt: tableStyle
        },
    ]
]
docx.createByJson(data)
const output = fs.createWriteStream('output.docx');
docx.generate(output);
