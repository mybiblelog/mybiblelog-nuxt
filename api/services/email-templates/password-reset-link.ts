import { LocaleCode } from "@shared/dist/i18n";
import { getLocaleBaseUrl } from "./helpers";

type RenderPasswordResetLinkParams = {
  locale: LocaleCode;
  passwordResetLink: string;
};

const render = ({
  locale,
  passwordResetLink,
}: RenderPasswordResetLinkParams) => {
  const subject = {
    de: 'Passwort zurücksetzen',
    en: 'Reset Password',
    es: 'Restablecer la contraseña',
    fr: 'Réinitialiser le mot de passe',
    pt: 'Redefinir senha',
    uk: 'Скидання пароля',
  }[locale];

  const link = getLocaleBaseUrl(locale) + '/reset-password?code=' + passwordResetLink;
  const html = {
    de: `Klicken Sie auf <a href="${link}">diesen Link</a>, um Ihr Passwort zurückzusetzen.`,
    en: `Click <a href="${link}">this link</a> to reset your password.`,
    es: `Haga clic en <a href="${link}">este enlace</a> para restablecer su contraseña.`,
    fr: `Cliquez sur <a href="${link}">ce lien</a> pour réinitialiser votre mot de passe.`,
    pt: `Clique em <a href="${link}">este link</a> para redefinir sua senha.`,
    uk: `Натисніть <a href="${link}">це посилання</a>, щоб скинути свій пароль.`,
  }[locale];

  return {
    subject,
    html,
  };
};

export default render;
