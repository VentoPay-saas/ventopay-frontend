import React, { useEffect, useState } from 'react';
import { Form, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import currencyService from '../../services/currency';
import { useDispatch, useSelector, batch } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import { fetchCurrencies } from '../../redux/slices/currency';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/loading';
import CurrencyForm from './currency-form';

export default function CurrencyEdit() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrency = (id) => {
    setLoading(true);
    currencyService
      .getById(id)
      .then(({ data }) => {
        setIsDefault(data?.default);
        form.setFieldsValue(data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values) => {
    const body = {
      title: values.title,
      symbol: values.symbol,
      rate: values.rate,
      active: Number(values.active),
      position: values.position,
    };
    const nextUrl = 'currencies';

    return currencyService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchCurrencies({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchCurrency(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.currency')}>
      {loading ? (
        <Loading />
      ) : (
        <CurrencyForm
          form={form}
          isDefault={isDefault}
          handleSubmit={handleSubmit}
        />
      )}
    </Card>
  );
}
