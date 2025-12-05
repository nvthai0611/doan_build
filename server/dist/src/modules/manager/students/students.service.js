"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
let StudentsService = class StudentsService {
    create(createStudentDto) {
        return 'This action adds a new student';
    }
    findAll() {
        return `This action returns all students`;
    }
    findOne(id) {
        return `This action returns a #${id} student`;
    }
    update(id, updateStudentDto) {
        return `This action updates a #${id} student`;
    }
    remove(id) {
        return `This action removes a #${id} student`;
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)()
], StudentsService);
//# sourceMappingURL=students.service.js.map