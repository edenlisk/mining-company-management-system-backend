const ActivityLogs = require('../models/activityLogsModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { toInitialCase } = require('../utils/helperFunctions');


exports.getAllLogs = catchAsync(async (req, res, next) => {
    const results = new APIFeatures(ActivityLogs.find(), req.query)
        .filter()
        .sort()
        .paginate()
    ;
    const logs = await results.mongooseQuery;
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    logs
                }
            }
        )
    ;
})

exports.getUserLogs = catchAsync(async (req, res, next) => {
    const results = new APIFeatures(ActivityLogs.find({userId: req.params.userId}), req.query)
        .filter()
        .sort()
        .paginate()
    ;
    const logs = await results.mongooseQuery;
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    logs
                }
            }
        )
    ;
})

exports.trackUpdateModifications = (body, entry, req) => {
    const modifications = [];
    for (const key in body) {
        if (body.hasOwnProperty(key)) {
            if (`${key}` !== "output" && body[key] !== entry[key]) {
                modifications.push(
                    {
                        fieldName: `${toInitialCase(key)}`,
                        initialValue: entry[key],
                        newValue: body[key]
                    }
                );
            } else {
                if (`${key}` === "output") {
                    for (const lot of body.output) {
                        for (const key in lot) {
                            if (lot.hasOwnProperty(key)) {
                                if (lot[key] !== entry.output[body.output.indexOf(lot)][key]) {
                                    modifications.push(
                                        {
                                            fieldName: `${toInitialCase(key)}`,
                                            initialValue: entry.output[body.output.indexOf(lot)][key],
                                            newValue: lot[key]
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (modifications.length > 0) {
        return new ActivityLogs(
            {
                logSummary: `${req.user.username} modified/added cassiterite entry`,
                username: req.user.username,
                userId: req.user._id,
                link: `/complete/${entry.mineralType}/${entry._id}`,
                modifications
            }
        )
    }

}

exports.trackDeleteOperations = (entryId, model, req) => {
    return new ActivityLogs(
        {
            logSummary: `${req.user.username} moved to trash ${model} entry`,
            username: req.user.username,
            userId: req.user._id,
            link: `/trash/${model}/${entryId}`,
            modifications: null
        }
    )

}

exports.trackCreateOperations = (entryId, model, req) => {
    return new ActivityLogs(
        {
            logSummary: `${req.user.username} created ${model} entry`,
            username: req.user.username,
            userId: req.user._id,
            link: `/complete/${model}/${entryId}`,
            modifications: null
        }
    )
}
