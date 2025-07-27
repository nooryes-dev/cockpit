import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

@ApiSchema({ description: '注册验证码' })
export class SendRegisterCaptchaDto {
  @ApiProperty({
    description: '收件地址',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  to: string;
}
