import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from '@/libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/authentication/dto/sign-up.dto';
import { compare } from 'bcrypt';
import { ConfigService } from '@/libs/config';
import { constants, privateDecrypt } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @description 修改用户密码
   */
  async updatePassword(
    id: number,
    { newPassword, password }: UpdatePasswordDto,
  ) {
    // 校验当前用户的老密码是否正确
    await this.validate({ id, password });

    // 更新密码
    return !!(await this.userRepository.save(
      this.userRepository.create({
        id,
        password: this.decryptByRsaPrivateKey(newPassword),
      }),
    ));
  }

  /**
   * @description 验证账号密码
   */
  async validate({
    username,
    password,
    id,
  }: {
    id?: number;
    username?: string;
    password: string;
  }) {
    // 获取指定用户
    const _user = await this.userRepository.findOne({
      where: {
        username,
        id,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!_user) {
      throw new Error('不存在当前用户名！');
    }

    // 比较当前密码
    if (!(await compare(password, _user.password))) {
      throw new Error('密码不正确！');
    }

    return _user;
  }

  /**
   * @description 注册
   */
  async signUp({ password, username }: SignUpDto) {
    return await this.userRepository.save(
      this.userRepository.create({
        username,
        password,
      }),
    );
  }

  /**
   * @description 利用RSA私钥解密前端传输过来的密文密码
   */
  decryptByRsaPrivateKey(encoding: string): string {
    const privateKey = this.configService.rsaPrivateKey;

    if (!privateKey) {
      return encoding;
    }

    try {
      return privateDecrypt(
        { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
        Buffer.from(encoding, 'base64'),
      ).toString();
    } catch {
      return encoding;
    }
  }
}
