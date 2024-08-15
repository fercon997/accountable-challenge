export type EmailInput = {
  email: string;
  title: string;
  body: string;
};

export interface IEmailService {
  sendEmail(mail: EmailInput): boolean;
}

export const IEmailService = Symbol('IEmailService');
