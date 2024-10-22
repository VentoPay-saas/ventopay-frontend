import React, { useEffect } from 'react';
import { Card, Form } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import { shallowEqual, useDispatch, useSelector, batch } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import careerService from '../../services/career';
import { useTranslation } from 'react-i18next';
import { fetchCareer } from 'redux/slices/career';
import getTranslationFields from 'helpers/getTranslationFields';
import CareerForm from './career-form';

const CareerAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [form] = Form.useForm();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

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
      active: Number(values.active),
      category_id: values.category_id.value,
      type: values.type,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      address: getTranslationFields(languages, values, 'address'),
    };
    const nextUrl = 'catalog/career';

    return careerService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchCareer({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => console.error(err.response.data.params));
  };

  return (
    <Card title={t('add.career')} extra={<LanguageList />}>
      <CareerForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};
export default CareerAdd;
