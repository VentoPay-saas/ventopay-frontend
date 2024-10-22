import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../../components/language-list';
import sellerBookingTable from '../../../services/seller/booking-table';
import BookingForm from './table-form';

const BookingTableClone = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBox = (id) => {
    setLoading(true);
    sellerBookingTable
      .getById(id)
      .then((res) => {
        let data = {
          ...res?.data,
          shop_section_id: {
            label: res?.data?.shop_section?.translation?.title,
            value: res?.data?.shop_section?.id,
          },
        };
        form.setFieldsValue({
          ...data,
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values) => {
    const body = {
      ...values,
      chair_count: String(values.chair_count),
      shop_section_id: values.shop_section_id.value,
    };
    const nextUrl = 'seller/booking/tables';

    return sellerBookingTable.create(body).then(() => {
      toast.success(t('successfully.cloned'));
      navigate(`/${nextUrl}`);
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) fetchBox(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('clone.booking.table')}
      extra={<LanguageList />}
      loading={loading}
    >
      <BookingForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default BookingTableClone;
