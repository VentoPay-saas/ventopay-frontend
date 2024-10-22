import React, { useEffect } from 'react';
import { Card, Form } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import brandService from '../../../services/seller/brands';
import { sellerfetchBrands } from '../../../redux/slices/brand';
import BrandForm from './brand-form';

const SellerBrandAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const nextUrl = 'seller/brands';
    const paramsData = { status: 'published' };
    const body = {
      ...values,
      active: values.active ? 1 : 0,
      'images[0]': image[0]?.name,
    };

    return brandService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(sellerfetchBrands(paramsData));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.brand')}>
      <BrandForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};
export default SellerBrandAdd;
