const { body, validationResult } = require("express-validator")

const responseWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createOrderValidation = [
  body('shippingAddress.street')
    .isString()
    .withMessage('Street must be a string')
    .notEmpty()
    .withMessage("Street is required"),
  body('shippingAddress.city')
    .isString()
    .withMessage('City must be a string')
    .notEmpty()
    .withMessage("City is required"),
  body('shippingAddress.state')
    .isString()
    .withMessage('State must be a string')
    .notEmpty()
    .withMessage("State is required"),
  body('shippingAddress.zip')
    .isString()
    .withMessage('zip must be a string')
    .notEmpty()
    .withMessage("zip is required"),
  body('shippingAddress.country')
    .isString()
    .withMessage('Country must be a string')
    .notEmpty()
    .withMessage("Country is required"),
    responseWithValidationErrors
]

module.exports = { createOrderValidation }