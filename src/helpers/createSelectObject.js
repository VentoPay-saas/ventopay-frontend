import { t } from 'i18next';

const createSelectObject = (data) => {
  if (!data?._id) return null;
  return {
    label:
      (data ? data?.title : data?.title) || t('N/A'),
    value: data?.id,
    key: data?.id,
  };
};

export default createSelectObject;
