import { HttpStatus } from '@nestjs/common';

interface Meta {
  [key: string]: any;
}

export const successResponse = (
  res: any,
  data: any = {},
  meta: Meta = {},
  status: number = HttpStatus.ACCEPTED,
  message: string = '',
) => {
  return res.status(status).json({
    success: true,
    data,
    meta,
    message,
  });
};

export const errorResponse = (
  res: any,
  error: any = {},
  status: number = HttpStatus.BAD_GATEWAY,
  message: string = '',
) => {
  return res.status(status).json({
    success: false,
    error,
    message,
  });
};
