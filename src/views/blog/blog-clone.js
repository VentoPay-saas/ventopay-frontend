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
import { fetchBlogs } from '../../redux/slices/blog';
import blogService from '../../services/blog';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import createImage from '../../helpers/createImage';
import { useTranslation } from 'react-i18next';
import BlogForm from './blog-form';

export default function BlogClone() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uuid } = useParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values, image) => {
    const nextUrl = 'blogs';
    const paramsData = { status: 'published', type: 'blog' };
    const body = {
      type: 'blog',
      active: values.active ? 1 : 0,
      images: [image[0]?.name],
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      short_desc: getTranslationFields(languages, values, 'short_desc'),
    };

    return blogService.create(body).then(() => {
      toast.success(t('successfully.cloned'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBlogs(paramsData));
      });
      navigate(`/${nextUrl}`);
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
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.description,
      [`short_desc[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.short_desc,
    }));
    return Object.assign({}, ...result);
  }

  const fetchBlog = (uuid) => {
    setLoading(true);
    blogService
      .getById(uuid)
      .then((res) => {
        let blog = res.data;
        const data = {
          ...blog,
          ...getLanguageFields(blog),
          image: [createImage(blog.img)],
        };
        form.setFieldsValue(data);
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchBlog(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('clone.blog')} extra={<LanguageList />}>
      {!loading ? (
        <BlogForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
