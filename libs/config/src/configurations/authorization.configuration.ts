import { registerAs } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './tokens';

export default registerAs(NameSpaceToken.Authorization, () => {
  return {
    [PropertyToken.Admins]: ['admin', 'murukal'],
  };
});
