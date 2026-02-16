import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './auth/firebase.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [FirebaseService, PrismaService],
  exports: [FirebaseService, PrismaService],
})
export class CoreModule {}
