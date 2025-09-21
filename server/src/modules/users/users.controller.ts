import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { z } from 'zod';
import { UsersService } from './users.service';
import { ProductsService } from 'src/modules/products/products.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}
  @Get()
  async findAll(@Query() query) {
    // @Query() query, @Headers() header, @Res() res, @Req() req
    // const { keyword } = query;
    // gọi service
    // console.log(process.env.APP_NAME);
    // console.log(process.env.PORT);
    // console.log(req.cookies);
    // res.cookie('email', 'tienhai@gmail.com');
    // const response = {
    //   // users: await this.usersService.getUsers(),
    //   products: await this.productsService.getProducts(),
    //   query,
    // };
    // res.set('x-total-count', 10); // set response headers
    // return res.status(200).json(response); // dùng cookie thì sẽ phải có .json({});
    console.log(query);
    const {
      _page = 1,
      _limit = 3,
      _order = 'asc',
      _sort = 'id',
      filter_status,
      filter_name,
      filter_email,
      email_like,
      name_like,
      q,
    } = query;

    const filter = {} as {
      // status: boolean;
      [key: string]: string | boolean | object;
    };
    if (filter_status) {
      filter.status = filter_status === 'true';
    }
    if (filter_name) {
      filter.name = filter_name;
    }
    if (filter_email) {
      filter.email = filter_email;
    }
    if (email_like) {
      filter.email = {
        contains: email_like,
        mode: 'insensitive',
      };
    }
    if (name_like) {
      filter.name = {
        contains: name_like,
        mode: 'insensitive',
      };
    }
    if (q) {
      filter.OR = [
        {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const { count, row } = await this.usersService.findAll({
      page: +_page,
      limit: +_limit,
      order: _order,
      sort: _sort,
      filter,
    });
    return {
      count,
      currentPage: +_page,
      data: row,
    };
  }
  @Get(':id')
  find(@Param('id') userId: string) {
    console.log(userId);
    return this.usersService.findOne(+userId);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res) {
    const schema = z.object({
      name: z
        .string({
          required_error: 'Tên bắt buộc phải nhập',
        })
        .min(4, 'Tên phải từ 4 ký tự'),
      email: z
        .string({
          required_error: 'email bắt buộc phải nhập',
        })
        .email('email không đúng định dạng')
        .refine(async (email) => {
          const user = await this.usersService.findByEmail(email);
          return !user;
        }, 'Email đã được sử dụng'),
      password: z
        .string({
          required_error: 'mật khẩu bắt buộc phải nhập',
        })
        .min(6, 'Mật khẩu phải từ 6 ký tự'),
    });
    const validationFields = await schema.safeParseAsync(createUserDto);
    if (!validationFields.success) {
      const errors = await validationFields.error.flatten().fieldErrors;
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        errors,
      });
    }
    // return validationFields;
    const data = await this.usersService.create(createUserDto);
    console.log(data);
    return res.status(HttpStatus.CREATED).json(data);
  }

  @Patch(':id')
  update(@Body() body: UpdateUserDto, @Param('id') userId: string) {
    return this.usersService.update(+userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
