type Content = {
  type?: "table" | "image" | "text" ;
  content?: any;
}

type IUser = {
  _id?: string;
  userId?: string;
  name?: string;
  password?: string;
  role?: string;
  createdTime?: Date;
};


interface IParagraph {
  type: string;
  title?: string;
  text?: string;
  body?: any 
  column?: string;
}

interface IReport {
  _id?: string,
  paragraphs: []  
  title: string,
  createUserObjectId: string,
  updateUserObjectId: string,
  createdTime: Date,
  updatedTime: Date,
}

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
