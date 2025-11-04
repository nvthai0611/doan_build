"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const API_PREFIX = 'api/v1';
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (ValidationError) => {
            const newError = ValidationError.map((error) => {
                return {
                    [error.property]: Object.values(error.constraints)[0],
                };
            });
            return new common_1.BadRequestException(newError);
        },
    }));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigins = isProduction
        ? [
            'https://thayquang.site',
            'https://www.thayquang.site',
            process.env.FRONTEND_URL,
        ].filter(Boolean)
        : [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL,
        ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const isAllowed = allowedOrigins.some(allowed => {
                if (!allowed)
                    return false;
                return allowed === origin;
            });
            if (isAllowed) {
                callback(null, true);
            }
            else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(null, false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    app.use(cookieParser());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API COMMON')
        .setDescription('The API description')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    })
        .addTag('API ALL')
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory);
    await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
//# sourceMappingURL=main.js.map