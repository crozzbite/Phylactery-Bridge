
import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StartAuditUseCase } from '../application/use-cases/start-audit.use-case';
import { StartAuditDto } from '../application/dto/start-audit.dto';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PrismaService } from '../../../core/prisma/prisma.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly startAuditUseCase: StartAuditUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new audit session' })
  @ApiResponse({ status: 201, description: 'Audit session created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async startAudit(@Body() dto: StartAuditDto, @Req() req: any) { // req type defaults to any in Nest/Express, can be improved with custom interface later
    // 1. Resolve User (Firebase UID -> DB ID)
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Call Use Case
    return this.startAuditUseCase.execute({
      userId: user.id,
      workspaceId: dto.workspaceId,
      title: dto.title,
      description: dto.description,
      inputs: dto.inputs || {},
    });
  }
}
