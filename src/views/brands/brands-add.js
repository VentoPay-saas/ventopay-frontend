import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import brandService from '../../services/brand';
import { fetchBrands } from '../../redux/slices/brand';
import { useTranslation } from 'react-i18next';
import BrandForm from './brand-form';

const BrandsAdd = () => {
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
    const nextUrl = 'catalog/brands';
    const paramsData = {
      status: 'published',
    };
    const body = {
      ...values,
      active: values.active ? 1 : 0,
      'images[0]': image[0]?.name,
    };

    return brandService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBrands(paramsData));
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

export default BrandsAdd;
