import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: '认证token',
})
export class IsJwtValidDto {
  @ApiProperty({
    description: '登录系统',
    default: 'nooryes-web',
    required: false,
  })
  to?: string;
}
