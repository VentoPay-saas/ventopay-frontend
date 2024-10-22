import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Row, Switch } from 'antd';
import { DebounceSelect } from '../../components/search';
import MediaUpload from '../../components/upload';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import shopService from '../../services/shop';
import { setMenuData } from '../../redux/slices/menu';

export default function BannerForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const activeMenu = useSelector((state) => state.menu.activeMenu);

  // states
  const [image, setImage] = useState(
    activeMenu?.data?.img ? activeMenu?.data?.img : [],
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  // helper functions
  function formatShop(data) {
    return data.map((item) => ({
      label: item?.translation?.title,
      value: item?.id,
    }));
  }

  function handleValidation(value, item = null, length = 2) {
    const condition = !!item ? !value && item?.locale === defaultLang : !value;

    if (condition) {
      return Promise.reject(new Error(t('required')));
    } else if (value && value?.trim() === '') {
      return Promise.reject(new Error(t('no.empty.space')));
    } else if (value && value?.trim().length < length) {
      return Promise.reject(new Error(t(`must.be.at.least.${length}`)));
    }
    return Promise.resolve();
  }

  // request functions
  function fetchShopOptions(search) {
    const params = {
      search,
      perPage: 10,
      status: 'approved',
    };
    return shopService.getAll(params).then((res) => formatShop(res?.data));
  }

  //useEffects
  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      form={form}
      name={'banner-form'}
      initialValues={{ clickable: true, ...activeMenu?.data }}
      layout='vertical'
      onFinish={onFinish}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'title' + item?.locale}
              label={t('title')}
              name={`title[${item?.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    return handleValidation(value, item);
                  },
                },
              ]}
              hidden={item?.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'description' + item?.locale}
              label={t('description')}
              name={`description[${item?.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    return handleValidation(value, item, 5);
                  },
                },
              ]}
              hidden={item?.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'button_text' + item?.locale}
              label={t('button.text')}
              name={`button_text[${item?.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    return handleValidation(value, item);
                  },
                },
              ]}
              hidden={item?.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12}>
          <Form.Item
            rules={[
              {
                validator(_, value) {
                  return handleValidation(value);
                },
              },
            ]}
            label={t('url')}
            name={'url'}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('shop')}
            name={'shops'}
            rules={[{ required: true, message: t('required') }]}
          >
            <DebounceSelect
              mode='multiple'
              fetchOptions={fetchShopOptions}
              debounceTimeout={400}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('clickable')}
            name='clickable'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            rules={[
              {
                required: !image?.length,
                message: t('required'),
              },
            ]}
            label={t('image')}
            name='images'
          >
            <MediaUpload
              type='products'
              imageList={image}
              setImageList={setImage}
              form={form}
              length='1'
              multiple={false}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('submit')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
