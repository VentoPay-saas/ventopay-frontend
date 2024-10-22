import React, { useEffect } from 'react';
import { Form, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import currencyService from '../../services/currency';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { fetchCurrencies } from '../../redux/slices/currency';
import { useTranslation } from 'react-i18next';
import CurrencyForm from './currency-form';

export default function CurrencyAdd() {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values) => {
    const body = {
      title: values.title,
      symbol: values.symbol,
      rate: values.rate,
      active: Number(values.active),
      position: values.position,
    };
    const nextUrl = 'currencies';

    return currencyService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchCurrencies({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.currency')}>
      <CurrencyForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
