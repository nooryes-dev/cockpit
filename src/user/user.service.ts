import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from '@/libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description 修改用户密码
   */
  updatePassword(id: number, { captcha, password }: UpdatePasswordDto) {
    return `This action updates a #${captcha} ${password} user`;
  }

  /**
   * @description 验证账号密码
   */
  async validate({ username, password }: Pick<User, 'username' | 'password'>) {
    // 获取指定用户
    const _user = await this.userRepository.findOne({
      where: {
        username,
      },
      select: {
        password: true,
      },
    });

    if (!_user) {
      throw new Error('不存在当前用户名！');
    }

    // 比较当前密码
    if (password !== _user.password) {
      throw new Error('密码不正确！');
    }

    return this.jwtService.signAsync({
      id: _user.id,
    });
  }
}
