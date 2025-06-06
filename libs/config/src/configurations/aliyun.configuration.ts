import { registerAs } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './tokens';

export default registerAs(NameSpaceToken.Aliyun, () => {
  return {
    [PropertyToken.OssAccessKeyId]: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
    [PropertyToken.OssAccessKeySecret]:
      process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
    [PropertyToken.OssRoleArn]: process.env.ALIYUN_OSS_ROLE_ARN,
  };
});
