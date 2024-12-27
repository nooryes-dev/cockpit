import { Controller, Body, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: '修改密码' })
  @Patch('/update-password')
  update(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(1, updatePasswordDto);
  }
}
