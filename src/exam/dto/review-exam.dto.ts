import { MessageEvent } from 'typings/response.types';

export type ReviewExamMessageEvent = MessageEvent<
  | (
      | {
          analysis: string;
          score: string;
        }
      | string
    )
  | null
>;
