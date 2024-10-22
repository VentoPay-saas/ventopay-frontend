import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import paymentService from '../../../services/seller/payment';
import { fetchSellerPayments } from '../../../redux/slices/payment';
import PaymentForm from './payment-form';

const SellerPaymentEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPayment = (id) => {
    setLoading(true);
    paymentService
      .getById(id)
      .then(({ data }) => {
        const body = {
          ...data,
          payment_id: data.payment.tag,
          activePayment: {
            label: data.payment.tag,
            value: data.payment.id,
            key: data.payment.id,
          },
        };

        form.setFieldsValue({
          ...body,
        });

        dispatch(setMenuData({ activeMenu, data: body }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values) => {
    const body = {
      ...values,
      payment_id: values.activePayment.value,
    };

    return paymentService.update(id, body).then(() => {
      const nextUrl = 'seller/payments';
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchSellerPayments({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getPayment(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.payment')} className='h-100'>
      {!loading ? (
        <PaymentForm form={form} handleSubmit={handleSubmit} type='edit' />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default SellerPaymentEdit;
