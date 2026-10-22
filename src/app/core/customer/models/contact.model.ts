export interface ContactBranch {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
}

export interface ContactFormPayload {
  name: string;
  gender: string;
  phone: string;
  email: string;
  message: string;
}