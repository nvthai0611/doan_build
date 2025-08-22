import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { decrypt } from 'src/utils/crypto.helper.util';

@Injectable()
export class DecryptOrValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    let finalData = value;
    console.log('chạy');

    // Nếu có payload thì giải mã
    if (value?.payload) {
      const decrypted = decrypt<any>(value.payload);
      console.log('chạy vào đây', decrypted);

      if (!decrypted) {
        throw new BadRequestException('Invalid encrypted data');
      }
      finalData = decrypted;
    }

    // Nếu có DTO thì chạy validate
    if (metadata.metatype) {
      console.log(finalData);

      console.log('chạy ra rồi');
      const object = plainToInstance(metadata.metatype, finalData);
      console.log(object);
      const errors = validateSync(object, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      console.log(errors);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      console.log(object);
      return object;
    }
    console.log('chạy ra rồi');
    return finalData;
  }
}
