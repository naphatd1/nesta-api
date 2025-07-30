import { Module } from '@nestjs/common';
import { ErrorMessagesController } from './controllers/error-messages.controller';
import { FrontendHelperController } from './controllers/frontend-helper.controller';

@Module({
  controllers: [ErrorMessagesController, FrontendHelperController],
})
export class CommonModule {}