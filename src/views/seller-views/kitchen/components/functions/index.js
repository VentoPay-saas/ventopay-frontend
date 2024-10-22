import { Button, Card, Space } from 'antd';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addMenu } from 'redux/slices/menu';

const KitchenFunctions = ({ id = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const { setIsModalVisible } = useContext(Context);

  const goToCreate = () => {
    const url = 'seller/kitchen/create';
    dispatch(
      addMenu({
        id: 'create-kitchen',
        url,
        name: t('create.kitchen'),
      }),
    );
    navigate(`/${url}`);
  };

  const handleDeleteSelected = () => {
    if (!id?.length) {
      toast.warning(t('select.kitchens'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleFilter = (filter) => {
    if (filter.hasOwnProperty('search')) {
      if (!filter?.search?.trim()?.length) {
        queryParams.reset('search');
        return;
      }
      queryParams.set('search', filter.search);
    }
  };
  return (
    <Card>
      <Space wrap>
        <SearchInput
          placeholder={t('search')}
          handleChange={(e) => handleFilter({ search: e })}
          defaultValue={queryParams.get('search')}
          style={{ minWidth: 180 }}
          debounceTimeout={1000}
        />
        <Button onClick={handleDeleteSelected}>{t('delete.selected')}</Button>
        <Button type='primary' onClick={goToCreate}>
          {t('create.kitchen')}
        </Button>
      </Space>
    </Card>
  );
};

export default KitchenFunctions;
