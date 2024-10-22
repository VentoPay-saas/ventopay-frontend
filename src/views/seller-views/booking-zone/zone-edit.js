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
import bookingZoneService from '../../../services/seller/booking-zone';
import ZoneForm from './zone-form';

const BookingZoneEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);
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

  const createImages = (items) =>
    items.map((item) => ({
      uid: item.id,
      name: item.path,
      url: item.path,
    }));

  const fetchBox = (id) => {
    setLoading(true);
    bookingZoneService
      .getById(id)
      .then((res) => {
        const data = {
          ...res.data,
          title: {
            [defaultLang]: res?.data.translation.title,
          },
          area: Number(res?.data.area),
          image: createImages(res?.data?.galleries),
        };

        form.setFieldsValue({
          ...data,
        });

        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const handleSubmit = (values, image) => {
    const body = {
      ...values,
      area: String(values.area),
      images: image?.map((img) => img.name),
    };
    const nextUrl = 'seller/booking/zone';

    return bookingZoneService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      navigate(`/${nextUrl}`);
      dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchBox(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('edit.booking.zone')}
      extra={<LanguageList />}
      loading={loading}
    >
      <ZoneForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default BookingZoneEdit;
