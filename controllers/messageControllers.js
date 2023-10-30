const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.addMessage = catchAsync(async (req, res, next) => {
    const { chatId, senderId, text } = req.body;
    const message = await Message.create(
        {
            chatId,
            senderId,
            text
        }
    )
    if (!message) return next(new AppError("Unable to add message", 400));
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;

})

exports.getMessages = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    const messages = await Message.find({chatId});
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    messages
                }
            }
        )
    ;
})