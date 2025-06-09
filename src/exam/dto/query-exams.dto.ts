import { ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({
  name: '分页查询面试间列表',
})
export class QueryExamsDto extends Pagination {}
