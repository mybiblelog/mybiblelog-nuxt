import { LocaleCode } from '@shared/dist/i18n';
import { getLocaleBaseUrl } from './helpers';
import renderBrandedEmail from './branded-wrapper';

type RenderEmailUpdateParams = {
  locale: LocaleCode;
  currentEmail: string;
  newEmail: string;
  newEmailVerificationCode: string;
};

const render = ({
  locale,
  currentEmail,
  newEmail,
  newEmailVerificationCode,
}: RenderEmailUpdateParams) => {
  const subject = {
    de: 'Neue E-Mail-Adresse bestätigen',
    en: 'Confirm New Email Address',
    es: 'Confirmar nueva dirección de correo electrónico',
    fr: 'Confirmer la nouvelle adresse e-mail',
    ko: '새 이메일 주소 확인',
    pt: 'Confirmar nova endereço de email',
    uk: `Підтвердіть нову адресу електронної пошти`,
  }[locale];

  const link = getLocaleBaseUrl(locale) + '/change-email?code=' + newEmailVerificationCode;
  const contentHtml = {
    de: [
      `<p>Die My Bible Log-Konto mit der E-Mail-Adresse <strong>${currentEmail}</strong> hat eine Anfrage gestellt, ihre E-Mail-Adresse zu ändern zu <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Klicken Sie auf <a href="${link}">diesen Link</a>, um <strong>${newEmail}</strong> als neue E-Mail-Adresse für dieses Konto zu bestätigen.</p>`,
      '<p>Wenn Sie nicht angefragt haben, Ihre E-Mail-Adresse von My Bible Log zu ändern, können Sie diese Nachricht ignorieren.',
    ].join(''),
    en: [
      `<p>The My Bible Log account with email address <strong>${currentEmail}</strong> has requested to change their email address to <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Click <a href="${link}">this link</a> to confirm <strong>${newEmail}</strong> as the new email address for this account.</p>`,
      '<p>If you did not request to change your My Bible Log email address, you can ignore this message.',
    ].join(''),
    es: [
      `<p>La cuenta de My Bible Log con la dirección de correo electrónico <strong>${currentEmail}</strong> ha solicitado cambiar su dirección de correo electrónico a <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Haga clic en <a href="${link}">este enlace</a> para confirmar <strong>${newEmail}</strong> como la nueva dirección de correo electrónico para esta cuenta.</p>`,
      '<p>Si no solicitó cambiar su dirección de correo electrónico de My Bible Log, puede ignorar este mensaje.',
    ].join(''),
    fr: [
      `<p>Le compte My Bible Log avec l'adresse e-mail <strong>${currentEmail}</strong> a demandé à changer son adresse e-mail en <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Cliquez sur <a href="${link}">ce lien</a> pour confirmer <strong>${newEmail}</strong> comme la nouvelle adresse e-mail de ce compte.</p>`,
      '<p>Si vous n\'avez pas demandé à changer votre adresse e-mail My Bible Log, vous pouvez ignorer ce message.',
    ].join(''),
    pt: [
      `<p>A conta do My Bible Log com o endereço de email <strong>${currentEmail}</strong> solicitou a alteração do seu endereço de email para <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Clique em <a href="${link}">este link</a> para confirmar <strong>${newEmail}</strong> como o novo endereço de email para esta conta.</p>`,
      '<p>Se você não solicitou a alteração do seu endereço de email do My Bible Log, você pode ignorar esta mensagem.',
    ].join(''),
    ko: [
      `<p>이메일 <strong>${currentEmail}</strong>의 My Bible Log 계정이 이메일을 <strong>${newEmail}</strong>(으)로 바꾸길 요청했습니다.</p>`,
      '<br>',
      `<p><a href="${link}">이 링크</a>를 눌러 이 계정의 새 이메일로 <strong>${newEmail}</strong>을(를) 확인하세요.</p>`,
      '<p>My Bible Log 이메일 변경을 요청하지 않았다면 이 메일을 무시하셔도 됩니다.',
    ].join(''),
    uk: [
      `<p>Обліковий запис My Bible Log з електронною адресою <strong>${currentEmail}</strong> запросив змінити свою електронну адресу на <strong>${newEmail}</strong>.</p>`,
      '<br>',
      `<p>Натисніть <a href="${link}">це посилання</a>, щоб підтвердити <strong>${newEmail}</strong> як нову адресу електронної пошти для цього облікового запису.</p>`,
      '<p>Якщо ви не просили змінити свою адресу електронної пошти My Bible Log, ви можете проігнорувати це повідомлення.',
    ].join(''),
  }[locale];

  return {
    subject,
    html: renderBrandedEmail({ title: subject, contentHtml }),
  };
};

export default render;
