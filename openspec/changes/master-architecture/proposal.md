# Master Architecture: Phylactery-Bridge (NestJS)

## Objective
Elevate the `Phylactery-Bridge` SaaS backend to "SkullRender Master" standards by enforcing strict typing, automated API documentation, and clean architecture boundaries.

## Scope
1.  **API Layer**: Replace `any` in Controllers with strict `class-validator` DTOs.
2.  **Documentation**: Implement `@nestjs/swagger` decorators on all endpoints.
3.  **Data Layer**: Verify Repository Pattern usage (already present, need to enforce 100% coverage).
4.  **Security**: Ensure all endpoints are guarded.

## Success Criteria
- No `any` in `@Body()`, `@Query()`, or `@Param()` in Controllers.
- Swagger UI (`/api/docs`) is fully functional and descriptive.
- All Use Cases define strict Interfaces/DTOs.
