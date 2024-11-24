const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
        lowercase:true,
    },
    role: {
        type: String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    profilePhoto: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL8AAACUCAMAAAD1XwjBAAAAMFBMVEXk5ueutLepsLPP0tTo6uuyuLvg4uPZ3N25vsG/xMbIzM68wcTR1dbr7e62vL7Mz9E0vhaVAAAEMUlEQVR4nO2c2ZaDIAyGBSPIor7/2w7YdrrZliWacI7f1cycufgjSQiY2HUnJycnJyf4AFArKASCcqUjSq2/tASA8tbNw4V5dtY3tBKg7CzeGJZGTPCjlO/yhZBy8NTafgGqHzbFX00YesV4DYL6+Yv61YKx77haANp8F3/BaZ4GwDKkyI+RzNIA98N1Hp1oohb7hvoWt28GDIpa7ws60Xf+fYhXEOTKF2LmZEC+/LgC1Kr/UQXygwFcYgBK1EcDeHgQpCfOFwwHA6AvlS8Eg40MSmL3BoMsqly5fCENtXzoK+QHA6hPBGrjpJXDTKx/KQ/eywL0pBGg6tRHKOVD7eMnXoDSnfcRwl0YdPXjD3gyA6aKreuOI9OPEL2CsJCGBUW/oIpgGFHkkxURZceWd0aagwx4JP1EVShYHPmhiKPRbzCyf9RvKeSHyh9LvyEJAIWTfgRRAFcdHJ+ZG9cvKHZgRP2SRL/Hkn/qP/Wf+g/X33r+OfP/DZL9t/X6p+7m+Qma+rNrvP5v/vzV+Pm3+u7/BtH9Q/P3P63fv7V+/9lNKAFAd//c+v1/6+9fmn//hRDBkraDoPH3v82/f6/sfxDU/Q9dV3UKIO8/CXtAhXwG/T+t91813/8WDCg8xzDpPyzu/6SWfafgKkhyiN0bBXdZnOQHcrMoo+7nK9tDR5/k8xvjyTjNS7oj1xegTwsCyXT+Jc4fpfiQ4RW5D0Dnf89/ebbzX13r83cX/PBp/nGmr/YTgKmzG5E8LGpi/+yvXOZ/3bhOAM/j6KxXbQzP/nOfv9btzV9HwStT4PojtaQ0ombotPaLtcZdMNYu3msFE2sz4kPWwe1D7G7ln/i32Sya61ro3oTE+aOKi/8gndVcRtciMU4X8yHpf7BCjDY6FP1CQHzuo8gqnq82DMGZaGuJkOYXM296e6IJYWMgW4QQra7+Deowh32ZQn0oEpDevwtzfFGnTL7LfyZW1ccRYtZiql8tcP6gRYD4mQdk9SvukLMBKDy/f0YKt3syAtgq7fFw+y4B6J2e/R27pwF2b/Xrpy32skD/ulxAsmDZp7rDarf6bcAOX6gBvG69BAbsngjAmvVKxaDWROAP8fwH5Ii5AvVtGvmMeHnogLT5jkT7Qs1hiefFAJwVQGtTzTcAYyubSJznZkD1+Rihw6qG2vYaxCGRMiobVBBnLMqo601XI6n3rFSUEmgTvjWUfybr+Kphk6G0FAIW8otbFOHIivkrRR5EnjrvlCVRtPGoegpyUG1jJyoFC3DoefEX+RNKTHLnFemynz8j7xcFE6ookxV45M4oAWHVv03m86eW+0rmJszMfURmFQRJH6I+FJnz+JlUbk/kOJBiqD+jWZ1V7XBjztDPz/2zzmGANNiLSk7DN0v96QFMfmuySXLXcTh5SYakJyDVcySnRQIYkiG/Hf4AtYZBmMrUNK4AAAAASUVORK5CYII="
    },
    password: {
        type: String,
        required: true,
        select: false,

    },
}, { timestamps: true });


// userSchema.virtual('fullName').get(function() {
//     return `${this.firstName} ${this.lastName}`;
// });


// Indexes for optimized queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
