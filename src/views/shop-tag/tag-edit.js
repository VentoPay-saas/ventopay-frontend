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
import { useTranslation } from 'react-i18next';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';
import shopTagService from '../../services/shopTag';
import { fetchShopTag } from '../../redux/slices/shopTag';
import ShopTagForm from './tag-form';

const TagEdit = () => {
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
      uid: item,
      name: item,
      url: item,
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
    }));
    return Object.assign({}, ...result);
  }

  const getBanner = (alias) => {
    setLoading(true);
    shopTagService
      .getById(alias)
      .then((res) => {
        let tag = res.data;

        const data = {
          images: createImages([tag.img]),
          ...getLanguageFields(tag),
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
      images: image.map((image) => image.name),
      title: getTranslationFields(languages, values, 'title'),
    };
    const nextUrl = 'shop-tag';

    return shopTagService.update(id, body).then(() => {
      toast.success(t('successfully.updated'));
      batch(() => {
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchShopTag({}));
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
    <Card title={t('edit.shop.tag')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <ShopTagForm form={form} handleSubmit={handleSubmit} />
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default TagEdit;
