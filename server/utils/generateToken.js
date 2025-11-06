import jwt from 'jsonwebtoken';

export const generateToken = (res, userID) => {
    const token = jwt.sign({ userID }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '7d',
        algorithm: 'HS256',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export const generateVerificationToken = (userID) => {
    return jwt.sign({ userID }, process.env.JWT_VERIFICATION_SECRET, {
        expiresIn: '24h',
        algorithm: 'HS256',
    });
}
