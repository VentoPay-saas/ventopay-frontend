import { useContext, useState } from 'react';
import kitchenService from 'services/seller/kitchen';
import { Context } from 'context/context';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { setRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CustomModal from 'components/modal';
import List from './components/list';
import Functions from './components/functions';

const Kitchen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const handleDeleteShops = () => {
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    setLoadingBtn(true);
    kitchenService
      .delete(params)
      .then(() => {
        setId(null);
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleModalConfirm = () => {
    if (id?.length) {
      handleDeleteShops();
    }
  };

  return (
    <>
      <Functions id={id} />
      <List id={id} setId={setId} />
      <CustomModal
        click={handleModalConfirm}
        text={t('are.you.sure?')}
        loading={loadingBtn}
      />
    </>
  );
};

export default Kitchen;
