import {Module} from '@nestjs/common';
import {CustomerService} from './customer.service';
import {CustomerController} from './customer.controller';
import {RolesGuard} from '../auth/roles.guard';

@Module({
  providers: [CustomerService, RolesGuard],
  controllers: [CustomerController],
})
export class CustomerModule {}
