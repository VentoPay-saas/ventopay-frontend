import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import unitService from '../../services/unit';
import { fetchUnits } from '../../redux/slices/unit';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import UnitForm from './unit-form';

export default function UnitEdit() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUnit = (id) => {
    setLoading(true);
    unitService
      .getById(id)
      .then(({ data }) => {
        const translations = getLanguageFields(data);
        form.setFieldsValue({ ...data, ...translations });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.title,
    }));
    return Object.assign({}, ...result);
  }

  const handleSubmit = (values) => {
    const body = {
      ...values,
      active: values.active ? 1 : 0,
    };
    const nextUrl = 'catalog/units';

    return unitService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchUnits({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchUnit(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.unit')} extra={<LanguageList />}>
      {!loading ? (
        <UnitForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
