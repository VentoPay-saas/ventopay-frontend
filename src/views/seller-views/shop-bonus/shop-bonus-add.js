import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { fetchShopBonus } from 'redux/slices/shop-bonus';
import bonusService from 'services/seller/bonus';
import ShopBonusForm from './shop-bonus-form';

const ShopBonusAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.expired_at = JSON.stringify(data?.expired_at);
      dispatch(setMenuData({ activeMenu, data: data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      status: values.status,
      type: 'sum',
      value: values.value,
      bonus_stock_id: values.bonus_stock_id.value,
      bonus_quantity: values.bonus_quantity,
      bonusable_id: myShop.id,
    };
    const nextUrl = 'seller/bonus/shop';

    return bonusService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchShopBonus({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.bonus')} className='h-100'>
      <ShopBonusForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default ShopBonusAdd;
