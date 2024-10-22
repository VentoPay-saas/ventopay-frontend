import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, removeFromMenu, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { fetchShopBonus } from 'redux/slices/shop-bonus';
import bonusService from 'services/seller/bonus';
import Loading from 'components/loading';
import ShopBonusForm from './shop-bonus-form';

const ShopBonusEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const { id } = useParams();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.expired_at = JSON.stringify(data?.expired_at);
      dispatch(setMenuData({ activeMenu, data: data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getProducts(bonus) {
    const body = {
      ...bonus,
      expired_at: moment(bonus.expired_at, 'YYYY-MM-DD'),
      bonus_stock_id: {
        label:
          bonus?.bonusStock?.product?.translation?.title +
          ' ' +
          bonus.bonusStock?.extras.map((ext) => ext.value).join(', '),
        value: bonus?.bonusStock?.id,
      },
    };

    form.setFieldsValue({
      ...body,
    });

    dispatch(
      setMenuData({
        activeMenu,
        data: { ...body, expired_at: JSON.stringify(body.expired_at) },
      }),
    );
    setLoading(false);
  }

  const getBonus = (id) => {
    setLoading(true);
    bonusService
      .getById(id)
      .then((res) => {
        let bonus = res.data;
        getProducts(bonus);
      })
      .finally(() => dispatch(disableRefetch(activeMenu)));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getBonus(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const handleSubmit = (values) => {
    const body = {
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      status: values.status,
      type: 'sum',
      value: values.value,
      bonus_stock_id: values.bonus_stock_id.value,
      bonus_quantity: values.bonus_quantity,
      bonusable_id: myShop.id,
    };
    const nextUrl = 'seller/bonus/shop';

    return bonusService.update(id, body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchShopBonus({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('edit.bonus')} className='h-100'>
      {!loading ? (
        <ShopBonusForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default ShopBonusEdit;
