const userModel = require("../models/user.model");

async function registerUser (req, res) {
    const { username, email, password, fullName: { firstName, lastName }} = req.body;

    const isUserAlreadyExist = await userModel.findOne({
        $or: [
            {username},
            {email}
        ]
    })
    
    if (isUserAlreadyExist) {
        return res.status(409).json({ message: "Username or email already exists"})
    }

    const user = new userModel()
}

module.exports = {registerUser} ;