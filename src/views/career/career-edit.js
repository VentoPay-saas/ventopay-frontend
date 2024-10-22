import React, { useState, useEffect } from 'react';
import { Card, Form, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import careerService from '../../services/career';
import { useTranslation } from 'react-i18next';
import { fetchCareer } from '../../redux/slices/career';
import getTranslationFields from 'helpers/getTranslationFields';
import CareerForm from './career-form';

const CareerEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.description,
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const getCategory = (alias) => {
    setLoading(true);
    careerService
      .getById(alias)
      .then((res) => {
        let career = res.data;
        const body = {
          ...career,
          ...getLanguageFields(career),
          category_id: {
            label: career?.category?.translation?.title,
            value: career?.category?.id,
          },
          active: res?.data?.active ? res?.data?.active : false,
        };
        form.setFieldsValue(body);
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
      active: Number(values.active),
      category_id: values.category_id.value,
      type: values.type,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      address: getTranslationFields(languages, values, 'address'),
    };
    const nextUrl = 'catalog/career';
    return careerService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchCareer({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => console.error(err.response.data.params));
  };

  useEffect(() => {
    if (activeMenu.refetch) getCategory(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.career')} extra={<LanguageList />}>
      {!loading ? (
        <CareerForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' className='mt-5 pt-5' />
        </div>
      )}
    </Card>
  );
};
export default CareerEdit;
