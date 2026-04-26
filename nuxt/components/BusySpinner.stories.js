import BusySpinner from './BusySpinner.vue';

export default {
  title: 'Components/BusySpinner',
  component: BusySpinner,
};

export const Default = () => ({
  components: { BusySpinner },
  template: '<div style="padding:24px;background:#333"><BusySpinner /></div>',
});
