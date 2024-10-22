import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { fetchUnits } from '../../redux/slices/unit';
import unitService from '../../services/unit';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import UnitForm from './unit-form';

export default function UnitAdd() {
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
      active: values.active ? 1 : 0,
    };
    const nextUrl = 'catalog/units';

    return unitService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchUnits({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.unit')} extra={<LanguageList />}>
      <UnitForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
}
