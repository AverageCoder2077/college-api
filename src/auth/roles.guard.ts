import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from './user-role.enum';
import { Request } from 'express';

// Define a custom interface for the Request object with the 'user' property
interface RequestWithUser extends Request {
  user?: { sub: number; email: string; role: UserRole };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    const req = context.switchToHttp().getRequest<RequestWithUser>(); // Use our custom interface
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated'); // Explicitly handle unauthenticated user
    }
    return requiredRoles.includes(user.role);
  }
}