import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UserRole} from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = (request.headers?.authorization as string | undefined)?.toLowerCase() ?? '';

    if (authHeader.startsWith('bearer ')) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch (err) {
        // Fall back to demo auth when token validation fails
        // eslint-disable-next-line no-console
        console.warn('JWT validation failed, falling back to demo user:', err?.message ?? err);
      }
    }

    const url = (request.url as string | undefined) ?? '';
    const isAdminRoute = url.startsWith('/admin');
    const isSupplierRoute = url.startsWith('/supplier');

    // Demo/bypass mode: attach a stub user so role checks pass for admin/supplier/customer areas
    request.user = request.user ?? {
      sub: isAdminRoute
        ? process.env.DEMO_ADMIN_USER_ID ?? 'demo-admin'
        : isSupplierRoute
          ? process.env.DEMO_SUPPLIER_USER_ID ?? 'demo-supplier'
          : process.env.DEMO_CUSTOMER_USER_ID ?? 'demo-customer',
      role: isAdminRoute ? UserRole.ADMIN : isSupplierRoute ? UserRole.SUPPLIER : UserRole.CUSTOMER,
      phone: process.env.DEMO_CUSTOMER_PHONE ?? '+911234567890',
    };
    return true;
  }
}
