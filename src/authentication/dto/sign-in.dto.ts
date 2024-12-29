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
    description: '密码（经过私钥加密）',
  })
  password: string;
}
