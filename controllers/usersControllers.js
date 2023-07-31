const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { logger } = require('../utils/loggers');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    users
                }
            }
        )
    ;
})

exports.getOneUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) return next(new AppError("The Selected user no longer exists!", 400));
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    user
                }
            }
        )
    ;
})

exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) return next(new AppError("The Selected user no longer exists!", 400));
    if (req.body.permissions) user.permissions = req.body.permissions;
    if (req.body.role) user.role = req.body.role;
    if (req.body.active === true) {
        user.active = true;
        logger.info(`${user.name}'s account re-activated successfully`);
    }
    if (req.body.active === false) {
        user.active = false;
        logger.warn(`${user.name}'s account suspended/de-activated successfully`);
    }
    await user.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.userId);
    logger.warn(`${user.name}'s account deleted successfully`);
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})
