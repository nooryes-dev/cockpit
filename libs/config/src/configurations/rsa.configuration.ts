import { registerAs } from '@nestjs/config';
import { generateKeyPairSync } from 'crypto';
import { NameSpaceToken, PropertyToken } from './tokens';

export default registerAs(NameSpaceToken.Rsa, () => {
  // 利用 crypto 生成公私密钥对
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  return {
    [PropertyToken.PublicKey]: publicKey,
    [PropertyToken.PrivateKey]: privateKey,
  };
});
