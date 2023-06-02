interface IUser {
  _id?: string;
  userId: string;
  name: string;
  password: string;
  role: string; //admin, user, guest
  referReportIds?: string[];
  phone?: string;
  address?: string;
}

interface IERROR_CODE_TABLE {
  [key: string]: string;
}

type TERROR_RESPONSE = {
  error: string;
  message: string;
  detail: string;
};

type TERROR_CODE = string | undefined;
type TERROR_MESSAGE = string | undefined;
