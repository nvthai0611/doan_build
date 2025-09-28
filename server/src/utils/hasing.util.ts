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
}
