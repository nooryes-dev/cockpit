import { registerAs } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './tokens';

export default registerAs(NameSpaceToken.Aliyun, () => {
  return {
    [PropertyToken.AccessKeyId]: process.env.ALIYUN_ACCESS_KEY_ID,
    [PropertyToken.AccessKeySecret]: process.env.ALIYUN_ACCESS_KEY_SECRET,
    [PropertyToken.OssRoleArn]: process.env.ALIYUN_OSS_ROLE_ARN,

    [PropertyToken.DatabasePassword]: process.env.DATABASE_PASSWORD,
    [PropertyToken.DatabaseHost]: process.env.DATABASE_HOST || 'localhost',
    [PropertyToken.DatabasePort]: +(process.env.DATABASE_PORT || 3306),

    [PropertyToken.AlibabaApiKey]: process.env.ALIBABA_API_KEY,
  };
});
