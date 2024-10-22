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
import { fetchBanners } from '../../redux/slices/banner';
import bannerService from '../../services/banner';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import BannerForm from './banner-form';

const BannerClone = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { languages } = useSelector((state) => state.formLang, shallowEqual);

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
      [`button_text[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale,
      )?.button_text,
    }));
    return Object.assign({}, ...result);
  }

  const getBanner = (alias) => {
    setLoading(true);
    bannerService
      .getById(alias)
      .then((res) => {
        let banner = res.data;

        const data = {
          ...banner,
          img: createImages(banner.galleries),
          shops: banner.shops?.map((item) => ({
            label: item.translation?.title,
            value: item.id,
          })),
          ...getLanguageFields(banner),
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
    const nextUrl = 'banners';
    const paramsData = {
      status: 'published',
    };
    const body = {
      url: values.url,
      shops: values.shops?.map((i) => i.value),
      images: image.map((image) => image.name),
      clickable: values.clickable,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      button_text: getTranslationFields(languages, values, 'button_text'),
    };

    return bannerService.create(body).then(() => {
      toast.success(t('successfully.cloned'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBanners(paramsData));
      });
      navigate(`/${nextUrl}`);
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getBanner(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('clone.banner')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <BannerForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default BannerClone;
