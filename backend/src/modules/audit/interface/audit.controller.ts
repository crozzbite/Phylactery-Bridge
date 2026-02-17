
import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { StartAuditUseCase } from '../application/use-cases/start-audit.use-case';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly startAuditUseCase: StartAuditUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async startAudit(@Body() body: any, @Req() req: any) {
    // 1. Resolve User (Firebase UID -> DB ID)
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Call Use Case
    // TODO: Validate body with DTO
    return this.startAuditUseCase.execute({
      userId: user.id,
      workspaceId: body.workspaceId, // TODO: Validate workspace access
      title: body.title || 'New Audit',
      description: body.description,
      inputs: body.inputs || {},
    });
  }
}
