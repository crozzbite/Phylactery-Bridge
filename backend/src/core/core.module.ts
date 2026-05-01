import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './auth/firebase.service';
import { IdentityResolverService } from './auth/identity-resolver.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [FirebaseService, PrismaService, IdentityResolverService],
  exports: [FirebaseService, PrismaService, IdentityResolverService],
})
export class CoreModule {}
