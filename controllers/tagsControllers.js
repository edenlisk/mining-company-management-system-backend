const Tag = require('../models/tagsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTags = catchAsync(async (req, res, next) => {
    const results = new APIFeatures(Tag.find(), req.query)
        .filter()
        .sort()
        .paginate()
    ;
    const tags = await results.mongooseQuery;
    // const tags = await Tag.find().populate({
    //     path: "entryId supplierId",
    //     select: "companyName beneficiary weightIn numberOfTags mineralType output supplyDate",
    // }).sort({ createdAt: -1 })
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

exports.createAndUpdateTags = catchAsync(async (req, res, next) => {
    const {tags} = req.body;
    if (tags?.length === 0) return next(new AppError("No tags provided", 400));
    for (const tag of tags) {
        if (tag.tagNumber === "") continue;
        const existingTag = await Tag.findOne({tagNumber: tag.tagNumber});
        if (!existingTag) {
            await Tag.create(
                {
                    tagNumber: tag.tagNumber,
                    tagType: tag.tagType,
                    weight: Number(tag.weight),
                    sheetNumber: tag.sheetNumber,
                    entryId: tag.entry,
                }
            )
        } else {
            if (existingTag.weight !== tag.weight) existingTag.weight = tag.weight;
            if (existingTag.sheetNumber !== tag.sheetNumber) existingTag.sheetNumber = tag.sheetNumber;
            if (existingTag.supplierId !== tag.supplierId) existingTag.supplierId = tag.supplierId;
            if (existingTag.entryId?.equals(tag.entry)) existingTag.entryId = tag.entry;
            await existingTag.save({validateModifiedOnly: true});
        }
    }
    res
        .status(202)
        .json(
            {
                success: true
            }
        )
    ;
});

exports.updateTag = catchAsync(async (req, res, next) => {
    const tag = await Tag.findOneAndUpdate(
        { tagNumber: req.params.tagNumber },
        {
            status: req.body.status,
            exportDate: new Date(),
        },
        {new: true});
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

exports.createTag = catchAsync(async (req, res, next) => {
    await Tag.create(
        {
            tagNumber: req.body.tagNumber,
            supplierId: req.body.supplierId,
            sheetNumber: req.body.sheetNumber,
            weight: req.body.weight,
            status: "in store",
            tagType: "mine"
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

exports.deleteTag = catchAsync(async (req, res, next) => {
    const deletedTag = await Tag.findOneAndDelete({tagNumber: req.params.tagNumber});
    if (!deletedTag) return next(new AppError("Unable to delete tag", 400));
    res
        .status(200)
        .json(
            {
                success: true,
                deletedTag
            }
        )
    ;
})

exports.getSupplierTags = catchAsync(async (req, res, next) => {
    const tags = await Tag.find({ supplierId: req.params.supplierId, tagType: "mine", status: "in store", entryId: null });
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
