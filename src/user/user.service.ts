import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from '@/libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SignUpDto } from 'src/authentication/dto/sign-up.dto';
import { compare } from 'bcrypt';
import { ConfigService } from '@/libs/config';
import { privateDecrypt } from 'crypto';
import { isVoid } from '@aiszlab/relax';

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
    if (
      !(await compare(this.decryptByRsaPrivateKey(password), _user.password))
    ) {
      throw new Error('密码不正确！');
    }

    return _user;
  }

  /**
   * @description 注册
   */
  async signUp({ password, username, email }: Omit<SignUpDto, 'captcha'>) {
    return await this.userRepository.save(
      this.userRepository.create({
        username,
        password,
        email,
      }),
    );
  }

  /**
   * @description 利用RSA私钥解密前端传输过来的密文密码
   */
  decryptByRsaPrivateKey(encrypt: string): string {
    const privateKey = this.configService.rsaPrivateKey;

    if (!privateKey) {
      return encrypt;
    }

    try {
      return privateDecrypt(
        privateKey,
        Buffer.from(encrypt, 'base64'),
      ).toString();
    } catch {
      return encrypt;
    }
  }

  /**
   * @description 根据 id 获取用户
   */
  async getUserById(id: number) {
    const _user = await this.userRepository.findOneBy({ id });

    if (!_user) {
      throw new Error('当前用户信息失效！');
    }

    return _user;
  }

  /**
   * @description 根据 id 批量获取用户信息
   */
  getUsersByIds(ids: number[]): Promise<(User | null)[]>;
  getUsersByIds<T extends Record<string, string>, R extends object>(
    ids: R[],
    joins: T,
  ): Promise<R[]>;
  async getUsersByIds<T extends Record<string, string>, R extends object>(
    ids: number[] | R[],
    joins?: T,
  ): Promise<(User | R | null)[]> {
    const _ids = ids.reduce((prev, current) => {
      if (typeof current === 'number') {
        prev.add(current);
        return prev;
      }

      if (!joins) return prev;

      Object.keys(joins).forEach((key) => {
        if (isVoid(current[key])) return;
        prev.add(current[key]);
      });
      return prev;
    }, new Set<number>());

    const _users = (
      await this.userRepository.findBy({
        id: In(Array.from(_ids)),
      })
    ).reduce(
      (prev, current) => prev.set(current.id, current),
      new Map<number, User>(),
    );

    // 尝试注入用户信息
    return ids.map((item: number | R) => {
      if (typeof item === 'number') {
        return _users.get(item) ?? null;
      }

      if (!joins) return null;

      Object.keys(joins).forEach((key) => {
        if (isVoid(item[key])) return;
        const _user = _users.get(item[key]) ?? null;
        item[joins[key]] = _user;
      });
      return { ...item };
    });
  }
}
