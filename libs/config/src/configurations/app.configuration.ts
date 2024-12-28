import { registerAs } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './tokens';

export default registerAs(NameSpaceToken.App, () => ({
  [PropertyToken.Code]: 'nooryes',
}));
