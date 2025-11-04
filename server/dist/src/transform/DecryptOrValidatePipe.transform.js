"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecryptOrValidatePipe = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const crypto_helper_util_1 = require("../utils/crypto.helper.util");
let DecryptOrValidatePipe = class DecryptOrValidatePipe {
    transform(value, metadata) {
        let finalData = value;
        console.log('chạy');
        if (value?.payload) {
            const decrypted = (0, crypto_helper_util_1.decrypt)(value.payload);
            console.log('chạy vào đây', decrypted);
            if (!decrypted) {
                throw new common_1.BadRequestException('Invalid encrypted data');
            }
            finalData = decrypted;
        }
        if (metadata.metatype) {
            console.log(finalData);
            console.log('chạy ra rồi');
            const object = (0, class_transformer_1.plainToInstance)(metadata.metatype, finalData);
            console.log(object);
            const errors = (0, class_validator_1.validateSync)(object, {
                whitelist: true,
                forbidNonWhitelisted: true,
            });
            console.log(errors);
            if (errors.length > 0) {
                throw new common_1.BadRequestException(errors);
            }
            console.log(object);
            return object;
        }
        console.log('chạy ra rồi');
        return finalData;
    }
};
exports.DecryptOrValidatePipe = DecryptOrValidatePipe;
exports.DecryptOrValidatePipe = DecryptOrValidatePipe = __decorate([
    (0, common_1.Injectable)()
], DecryptOrValidatePipe);
//# sourceMappingURL=DecryptOrValidatePipe.transform.js.map