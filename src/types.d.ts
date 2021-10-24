type Content = {
  type?: "table" | "image" | "text" ;
  content?: any;
}

type IReport = {
  _id?: string;
  createUserObjectId?: string;
  title?: string;
  contents?: Contnt[];
  createdTime?: Date;
  updatedTime?: Date;
};

type IUser = {
  _id?: string;
  userId?: string;
  name?: string;
  password?: string;
  role?: string;
  createdTime?: Date;
};

type AppState = {
  accessToken: string | undefined;
  openSideBar: boolean;
  address: string | undefined;
  lat: number | undefined;
  long: number | undefined;
  loading: boolean;
  users: IUser[];
};

type ReduxState = {
  appReducer: AppState;
};

type TERROR_RESPONSE = {

};
