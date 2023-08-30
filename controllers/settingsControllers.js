const Settings = require('../models/settingsModel');
const catchAsync = require('../utils/catchAsync');



exports.addSetting = catchAsync(async (req, res, next) => {
    await Settings.create(
        {
            rmaFeeColtan: 125,
            rmaFeeCassiterite: 50,
            rmaFeeWolframite: 50
        }
    )
    res
        .status(201)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.updateSettings = catchAsync(async (req, res, next) => {
    const settings = await Settings.findOne().limit(1);
    if (req.body.rmaFeeColtan) settings.rmaFeeColtan = req.body.rmaFeeColtan;
    if (req.body.rmaFeeCassiterite) settings.rmaFeeCassiterite = req.body.rmaFeeCassiterite;
    if (req.body.rmaFeeWolframite) settings.rmaFeeWolframite = req.body.rmaFeeWolframite;
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})