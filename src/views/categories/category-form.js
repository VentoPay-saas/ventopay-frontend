import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RefetchSearch } from '../../components/refetch-search';
import MediaUpload from '../../components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import categoryService from '../../services/category';

export default function CategoryForm({ form, handleSubmit, error }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const { state } = useLocation();

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : []
  );

  //request functions
  async function fetchUserCategoryList(search) {
    const params = {
      perPage: 100,
      type: state?.parentId ? 'main' : 'sub_shop',
      active: 1,
      search,
    };
    return categoryService.selectPaginate(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
        key: item.id,
      }))
    );
  }

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='basic'
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        active: true,
        ...activeMenu.data,
      }}
      form={form}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.title + index}
              label={t('name')}
              name={`title[${item.locale}]`}
              help={
                error
                  ? error[`title.${defaultLang}`]
                    ? error[`title.${defaultLang}`][0]
                    : null
                  : null
              }
              validateStatus={error ? 'error' : 'success'}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 2) {
                      return Promise.reject(new Error(t('must.be.at.least.2')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <Input placeholder={t('name')} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.locale + index}
              label={t('description')}
              name={`description[${item.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 5) {
                      return Promise.reject(new Error(t('must.be.at.least.5')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea maxLength={250} rows={4} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('keywords')}
            name='keywords'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select mode='tags' style={{ width: '100%' }}></Select>
          </Form.Item>
        </Col>
        {!state?.parentId && (
          <Col span={12}>
            <Form.Item
              label={t('parent.category')}
              name='parent_id'
              // rules={[{ required: true, message: t('required') }]}
            >
              <RefetchSearch refetch fetchOptions={fetchUserCategoryList} />
            </Form.Item>
          </Col>
        )}

        <Col span={4}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                validator() {
                  if (image?.length === 0) {
                    return Promise.reject(new Error(t('required')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <MediaUpload
              type='categories'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
