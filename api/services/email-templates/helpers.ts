import { LocaleCode } from "@shared/dist/i18n";
import config from "../../config";

const baseUrl = config.siteUrl;

export const getLocaleBaseUrl = (locale: LocaleCode) => {
  const localePathSegment = locale === 'en' ? '' : '/' + locale;
  return baseUrl + localePathSegment;
};
