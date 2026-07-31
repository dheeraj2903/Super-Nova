const { body, validationResult } = require("express-validator");

function handleValidationErrors (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation Rules Definition
const createProductValidators = [
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("priceAmount")
    .notEmpty()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price amount must be a positive number"),

  body("priceCurrency")
    .optional()
    .toUpperCase()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be either INR or USD"),
    handleValidationErrors
]

module.exports = {
  createProductValidators,
};