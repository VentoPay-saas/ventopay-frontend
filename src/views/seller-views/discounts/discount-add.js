import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import moment from 'moment';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import discountService from '../../../services/seller/discount';
import { fetchDiscounts } from '../../../redux/slices/discount';
import { useTranslation } from 'react-i18next';
import DiscountForm from './discount-form';

export default function DiscountAdd() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      const values = form.getFieldsValue(true);
      const start = JSON.stringify(values.start);
      const end = JSON.stringify(values.end);
      const data = { ...values, start, end };
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const startDate = moment(values.start).format('YYYY-MM-DD');
    const endDate = moment(values.end).format('YYYY-MM-DD');

    if (startDate > endDate)
      return toast.error(t('start.date.must.be.before.end.date'));

    const body = {
      price: values.price,
      type: values.type,
      products: values.products.map((item) => item.value),
      start: values.start
        ? moment(values.start).format('YYYY-MM-DD')
        : undefined,
      end: values.end ? moment(values.end).format('YYYY-MM-DD') : undefined,
      images: [image[0]?.name],
    };
    const nextUrl = 'seller/discounts';

    return discountService.create(body).then(() => {
      toast.success(t('successfully.created'));
      dispatch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchDiscounts({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.discount')} className='h-100'>
      <DiscountForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
