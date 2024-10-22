import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from 'redux/slices/menu';
import { fetchPages } from 'redux/slices/pages';
import { useTranslation } from 'react-i18next';
import LanguageList from 'components/language-list';
import { api_url } from 'configs/app-global';
import axios from 'axios';
import getTranslationFields from 'helpers/getTranslationFields';
import PageForm from './page-form';

const PageAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const body = {
      images: image.map((img) => img.name),
      active: Number(values.active),
      type: values.type,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      buttons: {
        google_play_button_link: values?.google_play_button_link,
        app_store_button_link: values?.app_store_button_link,
      },
    };
    const nextUrl = 'pages';

    return axios({
      method: 'post',
      url: `${api_url}dashboard/admin/pages`,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      data: body,
      params: {},
    })
      .then(() => {
        toast.success(t('successfully.created'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchPages({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => toast.error(err.response?.data?.message));
  };

  return (
    <Card title={t('add.pages')} className='h-100' extra={<LanguageList />}>
      <PageForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default PageAdd;
