const Tag = require('../models/tagsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTags = catchAsync(async (req, res, next) => {
    const tags = await Tag.find().populate({
        path: "entryId",
        select: "companyName beneficiary weightIn numberOfTags mineralType output supplyDate",
    });
    res
        .status(200)
        .json(
            {
                status: "success",
                data: {
                    tags
                }
            }
        )
    ;
})

exports.updateTag = catchAsync(async (req, res, next) => {
    const tag = await Tag.findOneAndUpdate({ tagNumber: req.params.tagNumber }, {status: req.body.status}, {new: true});
    console.log(req.body)
    if (!tag) return next(new AppError("Unable to update tag status"));
    res
        .status(201)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

