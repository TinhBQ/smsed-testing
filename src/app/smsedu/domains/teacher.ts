import { IClass } from './class';
import { IDepartment } from './department';
import { ISubject } from './subject';

interface ITeacher {
  id?: string;
  name?: string;
  nickname?: string;
  position?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  qualification?: string;
  lessonPerWeek?: number;
  isUnionMember?: boolean;
  isPartyMember?: boolean;
  dateOfRecruitment?: string;
  status?: string;
  classes?: IClass;
  departmentNavigation?: IDepartment;
  mainSubject?: ISubject;
}

export { ITeacher };
