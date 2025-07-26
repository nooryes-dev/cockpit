import { ApiProperty } from '@nestjs/swagger';

export enum ImportType {
  Knowledge = 'knowledge',
  Questions = 'questions',
}

export class BatchImportDto {
  @ApiProperty({
    description: '关联分类code',
  })
  categoryCode: string;

  @ApiProperty({
    description: '导入类型',
    enum: ImportType,
  })
  importType: ImportType;

  @ApiProperty({
    description: '导入内容',
  })
  content: { title: string; content: string }[];
}
