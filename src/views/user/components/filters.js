import { useTranslation } from 'react-i18next';
import SearchInput from 'components/search-input';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { updateUserFilters, updateUserParams } from 'redux/slices/user';
import { updateClientFilters, updateClientParams } from 'redux/slices/client';

// prop type can be "client" | "user"

export default function UserFilters({ type = 'client' }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { filters } = useSelector((state) => state[type], shallowEqual);

  const handleFilter = (key, value = null) => {
    if (type === 'user') {
      batch(() => {
        dispatch(updateUserFilters({ [key]: value }));
        dispatch(updateUserParams({ page: 1 }));
      });
    } else if (type === 'client') {
      batch(() => {
        dispatch(updateClientFilters({ [key]: value }));
        dispatch(updateClientParams({ page: 1 }));
      });
    }
  };

  return (
    <SearchInput
      placeholder={t('search')}
      handleChange={(e) => handleFilter('search', e)}
      style={{ width: 200 }}
      resetSearch={!filters?.search}
      defaultValue={filters?.search}
    />
  );
}
