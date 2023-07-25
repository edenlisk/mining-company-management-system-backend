const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const Email = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {expiresIn: process.env.EXPIRES_ID});
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 20 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'Production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    res
        .status(statusCode)
        .json(
            {
                status: "Success",
                token,
                data: {
                    user
                }
            }
        )
    ;
}

exports.signup = catchAsync(async (req, res, next) => {
    const existingUser = await User.findOne({email: req.body.email.trim()});
    if (existingUser) return next(new AppError(`User with this ${req.body.email} email already exists`, 409));
    const user = await User.create(
        {
            name: req.body.name.trim(),
            // username: req.body.username.trim(),
            phoneNumber: req.body.phoneNumber.trim(),
            email: req.body.email.trim(),
            role: req.body.role.trim(),
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }
    );
    // const email = new Email(user, process.env.EMAIL_FROM);
    // const verifyLink = `${req.originalUrl}/`;
    // email.sendVerification('')
    createSendToken(user, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError("Please provide email and password", 400));
    const user = await User.findOne({email: email.trim()}).select("+password");
    if (!user || !(await user.verifyPassword(password))) {
        return next(new AppError("Invalid Email or Password", 401));
    }
    if (user.active !== true) return next(new AppError("Your account was suspended, please contact admin to re-activate", 401));
    user.password = undefined;
    createSendToken(user, 200, res);
})

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', '', {expires: new Date(Date.now() + 1000)});
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError("You're not logged in, Please login", 400));
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode.id);
    if (!user) return next(new AppError("Session has ended, Please login again", 401));
    if (user.changedPasswordAfter(decode.iat)) return next(new AppError("User recently changed password, Please login again", 401));
    if (user.active === false) return next(new AppError("Your account was suspended, Please contact admin to re-activate", 400));
    req.user = user;
    next();
})

exports.restrictTo = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError("You're not authorized to perform this action", 400));
    }
}