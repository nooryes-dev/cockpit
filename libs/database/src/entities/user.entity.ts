import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { _Preset } from './_preset.entity';
import { hashSync } from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '用户' })
@Entity({
  name: 'user',
})
export class User extends _Preset {
  @ApiProperty({ description: '用户名' })
  @Column({
    name: 'username',
    type: 'varchar',
    unique: true,
    length: 36,
  })
  username: string;

  @ApiProperty({ description: '用户邮箱' })
  @Column({
    name: 'email',
    type: 'varchar',
    length: 128,
  })
  email: string;

  @ApiProperty({ description: '头像', type: String })
  @Column({
    name: 'avatar',
    type: 'varchar',
    nullable: true,
    length: 128,
  })
  avatar: string | null;

  @Column({
    select: false,
  })
  password: string;

  /**
   * @description 校验密码复杂度
   */
  @BeforeInsert()
  @BeforeUpdate()
  private _validatePassword() {
    if (!this.password) return;
    if (
      !/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]/.test(
        this.password,
      )
    )
      throw new BadRequestException(
        '密码必须包含大写字母，小写字母，数据，特殊符号中任意三项！',
      );
  }

  /**
   * @description hash 密码
   */
  @BeforeUpdate()
  @BeforeInsert()
  private _hashPassword() {
    if (!this.password) return;
    this.password = hashSync(this.password, 10);
  }

  /**
   * @description 随机生成用户名
   */
  @BeforeInsert()
  private _generateUsername() {
    if (!!this.username) return;
    this.username = randomUUID();
  }
}
