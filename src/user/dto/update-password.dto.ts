import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@ApiSchema({ description: '修改密码' })
export class UpdatePasswordDto {
  @ApiProperty({
    description: '密码',
    required: true,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '新密码',
    required: true,
  })
  @IsNotEmpty()
  newPassword: string;
}
