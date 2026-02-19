import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartAuditDto {
  @ApiProperty({ example: 'My Audit Session' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Audit of Q1 financials' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'req-123' })
  @IsOptional()
  @IsString()
  workspaceId: string; // Made optional or required based on business logic, assuming required in controller logic but might be optional in pure DTO if not always passed

  @ApiProperty({ example: { year: 2024 } })
  @IsObject()
  inputs: Record<string, any>;
}
