import * as bcrypt from 'bcrypt';
const saltOfRounds = 10;
export default class Hash {
  static make(password: string) {
    return bcrypt.hashSync(password, saltOfRounds);
  }

  static hash(password: string) {
    return bcrypt.hashSync(password, saltOfRounds);
  }

  static verify(password: string, hash: string) {
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
