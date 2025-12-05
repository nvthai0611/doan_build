export default class Hash {
    static make(password: string): string;
    static hash(password: string): string;
    static verify(password: string, hash: string): boolean;
    static generateRandomPassword(): {
        rawPassword: string;
        hashedPassword: string;
    };
}
