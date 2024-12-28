import { Column, Entity } from 'typeorm';
import { _Preset } from './_preset.entity';

@Entity({
  name: 'user',
})
export class User extends _Preset {
  @Column({
    name: 'username',
  })
  username: string;

  @Column({
    name: 'avatar',
  })
  avatar: string;

  @Column({
    select: false,
  })
  password: string;
}
