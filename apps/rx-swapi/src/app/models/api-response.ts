import { PeoplePerson } from './person.model';

export type ApiResponse = {
  next: string | null;
  previous: string | null;
  total_pages: number;
  total_records: number;
  results: PeoplePerson[];
  url: string;
};

export type PeopleMetaData = Pick<
  ApiResponse,
  'next' | 'previous' | 'total_pages' | 'total_records'
>;
