import React from 'react';
import { Card, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { removeFromMenu, setRefetch } from '../../../redux/slices/menu';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSellerPayments } from '../../../redux/slices/payment';
import paymentService from '../../../services/seller/payment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PaymentForm from './payment-form';

export default function SellerPaymentAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const body = {
      ...values,
      payment_id: values.payment_id.value,
    };

    return paymentService
      .create(body)
      .then(() => {
        const nextUrl = 'seller/payments';
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchSellerPayments({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Card title={t('add.payment')} className='h-100'>
      <PaymentForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
