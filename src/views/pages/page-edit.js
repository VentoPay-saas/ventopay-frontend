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
import { fetchPages } from '../../redux/slices/pages';
import pageService from '../../services/pages';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../components/language-list';
import { IMG_URL, api_url } from 'configs/app-global';
import axios from 'axios';
import getTranslationFields from 'helpers/getTranslationFields';
import PageForm from './page-form';

const PageEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

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
    }));
    return Object.assign({}, ...result);
  }

  const getBanner = (alias) => {
    setLoading(true);
    pageService
      .getById(alias)
      .then((res) => {
        let page = res.data;
        const data = {
          ...page,
          ...getLanguageFields(page),
          ...page?.buttons,
          active: !!page?.active,
          image: [createImage(page?.galleries[0]?.path)],
        };
        form.setFieldsValue(data);
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
        setLoading(false);
      });
  };

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
      method: 'put',
      url: `${api_url}dashboard/admin/pages/${id}`,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      data: body,
      params: {},
    })
      .then(() => {
        toast.success(t('successfully.updated'));
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchPages({}));
        });
        navigate(`/${nextUrl}`);
      })
      .catch((err) => toast.error(err.response?.data?.message));
  };

  useEffect(() => {
    if (activeMenu.refetch) getBanner(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.page')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <PageForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default PageEdit;
