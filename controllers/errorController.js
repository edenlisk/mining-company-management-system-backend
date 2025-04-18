const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 401);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?/)[0];
    const message = `Duplicate field value: ${value}. please use another value`;
    return new AppError(message, 401);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors);
    const message = `Invalid input data: ${errors.join('. ')}`
    return new AppError(message, 401);
}

const sendErrorDev = (err, res) => {
    console.log(err);
    res
        .status(err.statusCode)
        .json(
            {
                status: err.status,
                error: err,
                message: err.message,
                stack: err.stack
            }
        )
    ;

}

const sendErrorProd = (err, res) => {
    console.log(err);
    if (err.isOperational) {
        res
            .status(err.statusCode)
            .json(
                {
                    status: err.status,
                    message: err.message,
                }
            )
        ;
    } else {
        console.log('Error', err);
        res
            .status(500)
            .json(
                {
                    status: 'Error',
                    message: 'something went wrong'
                }
            )
        ;
    }
}

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        sendErrorProd(err, res);
    }

};
