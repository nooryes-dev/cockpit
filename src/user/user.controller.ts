import { Controller, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response/api-unified-response.decorator';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ description: '修改密码' })
  @ApiUnifiedResponse({ type: 'string' })
  @Patch('/update-password')
  update(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(1, updatePasswordDto);
  }
}
