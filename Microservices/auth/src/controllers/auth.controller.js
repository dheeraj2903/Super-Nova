const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

async function registerUser (req, res) {
    try {
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
    
        const hash = await bcrypt.hash(password, 10)
    
        const user = await userModel.create({
            username,
            email,
            password: hash,
            fullName: { firstName, lastName }
        })
    
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' })
    
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        })
    
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        })
    } catch (err) {
        console.log("Error in registerUser",err);
        res.status(500).json({ message: "Internal server error" })
    }
}

async function loginUser(req, res) {
    
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({ $or: [ { email }, { username } ] }).select('+password');

        if(!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare( password, user.password || "");
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials'})
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        })

    } catch (err) {
        console.log("Error in loginUser", err);
        res.status(500).json({ message: "Internal server error"})
    }
}

async function  getCurrentUser(req, res) {
    return res.status(200).json({
        message: "Current user fetched successfully",
        user: req.user
    })
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
} 