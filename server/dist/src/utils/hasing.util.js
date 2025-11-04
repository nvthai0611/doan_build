"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const saltOfRounds = 10;
class Hash {
    static make(password) {
        return bcrypt.hashSync(password, saltOfRounds);
    }
    static hash(password) {
        return bcrypt.hashSync(password, saltOfRounds);
    }
    static verify(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
    static generateRandomPassword() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let rawPassword = '';
        for (let i = 0; i < 6; i++) {
            rawPassword += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return {
            rawPassword,
            hashedPassword: this.hash(rawPassword)
        };
    }
}
exports.default = Hash;
//# sourceMappingURL=hasing.util.js.map