import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: '注册信息',
})
export class SignUpDto {
  @ApiProperty({
    description: '用户邮箱',
    required: true,
    example: '<EMAIL>',
  })
  email: string;

  @ApiProperty({
    description: '用户名',
  })
  username: string;

  @ApiProperty({
    description: '密码（经过公钥加密）',
  })
  password: string;

  @ApiProperty({
    description: '注册验证码',
  })
  captcha: string;
}
