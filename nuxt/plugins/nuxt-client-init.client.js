import { useAppInitStore } from '~/stores/app-init';

export default (context) => {
  useAppInitStore(context.app.pinia).clientInit();
};
