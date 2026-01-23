import { LocaleCode } from "@shared/dist/i18n";
import { getLocaleBaseUrl } from "./helpers";

type RenderEmailVerificationParams = {
  locale: LocaleCode;
  emailVerificationCode: string;
};

const render = ({ locale, emailVerificationCode }: RenderEmailVerificationParams) => {
  const subject = {
    de: 'Email-Verifizierung',
    en: 'Email Verification',
    es: 'Verificación de correo electrónico',
    fr: 'Vérification de l\'adresse e-mail',
    pt: 'Verificação de email',
    uk: 'Підтвердження електронної пошти',
  }[locale];

  const link = getLocaleBaseUrl(locale) + '/verify-email?code=' + emailVerificationCode;
  const html = {
    de: `Klicken Sie auf <a href="${link}">diesen Link</a>, um Ihre E-Mail zu bestätigen.`,
    en: `Click <a href="${link}">this link</a> to verify your email.`,
    es: `Haga clic en <a href="${link}">este enlace</a> para verificar su correo electrónico.`,
    fr: `Cliquez sur <a href="${link}">ce lien</a> pour vérifier votre adresse e-mail.`,
    pt: `Clique em <a href="${link}">este link</a> para verificar seu email.`,
    uk: `Натисніть <a href="${link}">це посилання</a>, щоб підтвердити свою електронну пошту.`,
  }[locale];

  return {
    subject,
    html,
  };
};

export default render;
