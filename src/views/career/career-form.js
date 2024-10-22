import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Switch } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import CkeEditor from '../../components/ckeEditor';
import { DebounceSelect } from '../../components/search';
import { useTranslation } from 'react-i18next';
import careerCategoryService from 'services/category';

export default function CareerForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);

  // request functions
  async function fetchCareerList(search) {
    const params = {
      search: search,
      type: 'career',
      active: 1,
    };

    return careerCategoryService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation ? item.translation.title : 'no name',
        value: item.id,
      })),
    );
  }

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='basic'
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        parent_id: { title: '---', value: 0, key: 0 },
        active: true,
        ...activeMenu.data,
      }}
      form={form}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item?.title + index}
              label={t('name')}
              name={`title[${item.locale}]`}
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
        <Col span={12} />
        <Col span={24}>
          <CkeEditor form={form} lang={defaultLang} languages={languages} />
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('category')}
            name='category_id'
            rules={[{ required: true, message: t('required') }]}
          >
            <DebounceSelect fetchOptions={fetchCareerList} />
          </Form.Item>
        </Col>

        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.locale + index}
              label={t('location')}
              name={`address[${item.locale}]`}
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
              <Input />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12} />

        <Col span={24} className='mb-5' />
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
