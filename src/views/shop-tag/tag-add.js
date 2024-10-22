import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../helpers/getTranslationFields';
import LanguageList from '../../components/language-list';
import shopTagService from '../../services/shopTag';
import { fetchShopTag } from '../../redux/slices/shopTag';
import ShopTagForm from './tag-form';

const TagAdd = () => {
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
      images: image.map((image) => image.name),
      title: getTranslationFields(languages, values, 'title'),
    };
    const nextUrl = 'shop-tag';

    return shopTagService.create(body).then(() => {
      toast.success(t('successfully.created'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchShopTag({}));
      });
      navigate(`/${nextUrl}`);
    });
  };

  return (
    <Card title={t('add.shop.tag')} className='h-100' extra={<LanguageList />}>
      <ShopTagForm form={form} handleSubmit={handleSubmit} />
    </Card>
  );
};

export default TagAdd;
