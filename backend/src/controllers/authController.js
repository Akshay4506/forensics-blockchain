import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            role,
            organization: role // For now, org name matches role enum
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                organization: user.organization,
                walletAddress: user.walletAddress,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        let query = {};
        if (email) query.email = email;
        else if (phone) query.phone = phone;
        else return res.status(400).json({ message: 'Please provide email or phone' });

        const user = await User.findOne(query);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                organization: user.organization,
                walletAddress: user.walletAddress,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    res.json(req.user);
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.phone !== undefined) {
                user.phone = req.body.phone;
            }

            if (req.body.oldPassword && req.body.newPassword) {
                const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Old password is incorrect' });
                }
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.newPassword, salt);
            } else if (req.body.newPassword && !req.body.oldPassword) {
                return res.status(400).json({ message: 'Must provide old password to change password.' });
            }

            if (req.body.walletAddress !== undefined) {
                user.walletAddress = req.body.walletAddress;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                organization: updatedUser.organization,
                walletAddress: updatedUser.walletAddress,
                token: generateToken(updatedUser._id),
                message: 'Profile updated successfully'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
