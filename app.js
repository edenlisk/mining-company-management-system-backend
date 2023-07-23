const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/usersRouter');
const buyersRouter = require('./routes/buyersRouter');
const contractsRouter = require('./routes/contractsRouter');
const shipmentsRouter = require('./routes/shipmentsRouter');
const dueDiligenceRouter = require('./routes/dueDiligenceRouter');
const paymentsRouter = require('./routes/paymentsRouter');
const suppliersRouter = require('./routes/suppliersRouter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


const limiter = rateLimit(
    {
      max: 2000,
      windowMs: 60 * 60 * 1000,
      message: "Too many requests from this IP, please try again in an hour"
    }
)

app.use(hpp());
app.use(helmet());
app.use('/api', limiter);

app.use('/api/v1/', indexRouter);
app.use('api/v1/users', usersRouter);
app.use('/api/v1/buyers', buyersRouter);
app.use('/api/v1/contracts', contractsRouter);
app.use('/api/v1/shipments', shipmentsRouter);
app.use('/api/v1/payments', paymentsRouter)
app.use('/api/v1/suppliers', suppliersRouter);
app.use('/api/v1/duediligence', dueDiligenceRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 400));
})
app.use(globalErrorHandler);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
