import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from '../../redux/slices/menu';
import { fetchBanners } from '../../redux/slices/banner';
import bannerService from '../../services/banner';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../helpers/getTranslationFields';
import LanguageList from '../../components/language-list';
import BannerForm from './banner-form';

const BannerAdd = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const handleSubmit = (values, image) => {
    const nextUrl = 'banners';
    const paramsData = {
      status: 'published',
    };
    const body = {
      shops: values.shops?.map((i) => i.value),
      images: image.map((image) => image.name),
      url: values.url,
      clickable: values.clickable,
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      button_text: getTranslationFields(languages, values, 'button_text'),
    };

    return bannerService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchBanners(paramsData));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.banner')} className='h-100' extra={<LanguageList />}>
      <BannerForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default BannerAdd;
