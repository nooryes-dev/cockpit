import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

@ApiSchema({ description: '修改密码' })
export class UpdatePasswordDto {
  @ApiProperty({
    description: '密码',
    required: true,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '验证码',
    required: true,
  })
  @IsNumberString()
  captcha: string;
}
