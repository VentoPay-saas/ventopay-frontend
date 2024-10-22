import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import sellerBookingTable from '../../../services/seller/booking-table';
import BookingForm from './table-form';

const BookingTableAdd = () => {
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

  const handleSubmit = (values) => {
    const body = {
      ...values,
      chair_count: String(values.chair_count),
      shop_section_id: values.shop_section_id.value,
    };
    const nextUrl = 'seller/booking/tables';

    return sellerBookingTable.create(body).then(() => {
      toast.success(t('successfully.created'));
      navigate(`/${nextUrl}`);
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    });
  };

  return (
    <Card title={t('add.booking.table')}>
      <BookingForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default BookingTableAdd;
