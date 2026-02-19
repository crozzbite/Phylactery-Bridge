# Architecture Design (NestJS)

## 1. DTO Strategy
- **Input**: Create `*.dto.ts` classes in `interface/http/dto` or `application/dto`.
- **Validation**: Use strict decorators:
    ```typescript
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'My Audit' })
    title: string;
    ```
- **Transformation**: Enable global pipe `new ValidationPipe({ transform: true, whitelist: true })`.

## 2. API Documentation (Swagger)
- **Decorators**:
    - `@ApiOperation({ summary: '...' })`
    - `@ApiResponse({ status: 201, type: AuditSessionResponseDto })`
    - `@ApiBearerAuth()`

## 3. Layer Separation
- **Controller**: Handles HTTP, Validation, Auth. Delegates to UseCase.
- **UseCase**: Pure Business Logic. agnostic of HTTP.
- **Repository**: Handles Persistence (Prisma).
