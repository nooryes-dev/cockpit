import { Controller, Body, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { User } from '@/libs/database';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ description: '更新密码' })
  @ApiUnifiedResponse({ type: 'boolean', default: true })
  @UseGuards(JwtAuthGuard)
  @Patch('/update-password')
  update(@Body() updatePasswordDto: UpdatePasswordDto, @WhoAmI() { id }: User) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }
}
