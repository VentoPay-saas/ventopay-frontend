import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import moment from 'moment';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import discountService from '../../../services/seller/discount';
import { fetchDiscounts } from '../../../redux/slices/discount';
import { useTranslation } from 'react-i18next';
import createImage from '../../../helpers/createImage';
import Loading from '../../../components/loading';
import DiscountForm from './discount-form';

export default function DiscountEdit() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  function fetchDiscount() {
    setLoading(true);
    discountService
      .getById(id)
      .then(({ data }) => {
        const values = {
          price: data?.price,
          type: data?.type,
          products: data?.products.map((item) => ({
            label: item?.translation?.title,
            value: item?.id,
          })),
          start: moment(data?.start, 'YYYY-MM-DD'),
          end: moment(data?.end, 'YYYY-MM-DD'),
          image: [createImage(data?.img)],
        };
        form.setFieldsValue(values);
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...values, start: data?.start, end: data?.end },
          }),
        );
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchDiscount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

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

    return discountService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchDiscounts({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('edit.discount')} className='h-100'>
      {!loading ? (
        <DiscountForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <Loading />
      )}
    </Card>
  );
}
