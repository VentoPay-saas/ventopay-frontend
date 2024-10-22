import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { fetchBonus } from 'redux/slices/product-bonus';
import bonusService from 'services/seller/bonus';
import ProductBonusForm from './product-bonus-form';

const ProductBonusAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      const dataString = {
        ...data,
        expired_at: JSON.stringify(data?.expired_at),
      };

      dispatch(setMenuData({ activeMenu, data: dataString }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      status: values.status,
      type: 'count',
      bonusable_id: values.bonusable_id.value,
      value: values.value,
      bonus_stock_id: values.bonus_stock_id.value,
      bonus_quantity: values.bonus_quantity,
    };
    const nextUrl = 'seller/bonus/product';

    return bonusService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBonus({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.bonus')} className='h-100'>
      <ProductBonusForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default ProductBonusAdd;
