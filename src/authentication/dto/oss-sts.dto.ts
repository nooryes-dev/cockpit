import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Credentials } from 'ali-oss';

@ApiSchema({
  description: '阿里云 OSS 临时凭证',
})
export class OssStsResponse implements Credentials {
  @ApiProperty({
    description: 'AccessKeyId',
  })
  AccessKeyId: string;

  @ApiProperty({
    description: 'AccessKeySecret',
  })
  AccessKeySecret: string;

  @ApiProperty({
    description: '过期时间',
  })
  Expiration: string;

  @ApiProperty({
    description: '临时访问凭证',
  })
  SecurityToken: string;
}
