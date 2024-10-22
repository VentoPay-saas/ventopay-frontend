import { t } from 'i18next';

const createSelectObject = (data) => {
  if (!data?.id) return null;
  return {
    label:
      (data?.translation ? data?.translation?.title : data?.title) || t('N/A'),
    value: data?.id,
    key: data?.id,
  };
};

export default createSelectObject;
