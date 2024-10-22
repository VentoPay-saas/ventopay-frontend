import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../../components/language-list';
import sellerbookingService from '../../../services/seller/booking-zone';
import ZoneForm from './zone-form';

const BookingZoneAdd = () => {
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
    const body = {
      ...values,
      area: String(values.area),
      images: image?.map((img) => img.name),
    };
    const nextUrl = 'seller/booking/zone';

    return sellerbookingService.create(body).then(() => {
      toast.success(t('successfully.created'));
      navigate(`/${nextUrl}`);
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    });
  };

  return (
    <Card title={t('add.booking.zone')} extra={<LanguageList />}>
      <ZoneForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default BookingZoneAdd;
