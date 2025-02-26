import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: '登录信息',
})
export class SignInDto {
  @ApiProperty({
    description: '用户名',
  })
  username: string;

  @ApiProperty({
    description: '密码（经过公钥加密）',
  })
  password: string;

  @ApiProperty({
    description: '登录系统',
    default: 'nooryes-web',
    required: false,
  })
  to?: string;
}
