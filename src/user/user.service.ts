import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  /**
   * @description 修改用户密码
   */
  updatePassword(id: number, { captcha, password }: UpdatePasswordDto) {
    return `This action updates a #${captcha} ${password} user`;
  }
}
