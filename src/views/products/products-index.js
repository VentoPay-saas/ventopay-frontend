import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Switch } from 'antd';
import { DebounceSelect } from 'components/search';
import shopService from 'services/restaurant';
import brandService from 'services/brand';
import categoryService from 'services/category';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/product';
import { addMenu, replaceMenu, setMenuData } from 'redux/slices/menu';
import unitService from 'services/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MediaUpload from 'components/upload';
import TextArea from 'antd/lib/input/TextArea';
import { RefetchSearch } from 'components/refetch-search';
import { PlusOutlined } from '@ant-design/icons';
import { AsyncTreeSelect } from 'components/async-tree-select-category';
import { InfiniteSelect } from 'components/infinite-select';
import kitchenService from 'services/kitchen';

const ProductsIndex = ({ next, action_type = '', isRequest }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { uuid } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  const shop = Form.useWatch('shop', form);

  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState({ kitchen: false });
  const [fileList, setFileList] = useState(
    activeMenu.data?.images ? activeMenu.data?.images : [],
  );
  console.log("🚀 ~ ProductsIndex ~ fileList:", fileList)
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [nutrition, setNutrition] = useState(Boolean(activeMenu.data?.kcal));

  useEffect(() => {
    const fieldsValue = form.getFieldsValue(true);
    dispatch(
      setMenuData({ activeMenu, data: { ...activeMenu.data, ...fieldsValue } }),
    );
    // eslint-disable-next-line
  }, []);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const params = {
      ...values,
      active: Number(values.active),
      vegetarian: Number(values.vegetarian),
      brand_id: values.brand?.value,
      category_id: values.category?.value || values.category,
      shop_id: values.shop?.value,
      unit_id: values.unit?.value,
      kcal: nutrition ? String(values.kcal) : undefined,
      carbs: nutrition ? String(values.carbs) : undefined,
      protein: nutrition ? String(values.protein) : undefined,
      fats: nutrition ? String(values.fats) : undefined,
      kitchen_id: values?.kitchen?.value || undefined,
      images: undefined,
      brand: undefined,
      category: undefined,
      shop: undefined,
      unit: undefined,
      kitchen: undefined,
      tax: values.tax || 0,
      ...Object.assign(
        {},
        ...fileList.map((item, index) => ({
          [`images[${index}]`]: item,
        })),
      ),
    };

    if (isRequest) {
      dispatch(
        setMenuData({
          activeMenu,
          data: {
            ...activeMenu.data,
            ...params,
            images: fileList,
            brand: values.brand,
            category: values.category,
            shop: values.shop,
            unit: values.unit,
            tax: values.tax || 0,
            kitchen: values?.kitchen || undefined,
            title: {
              ...Object.assign(
                {},
                ...languages.map((lang) => ({
                  [lang.locale]: values[`title[${lang.locale}]`],
                })),
              ),
            },
            description: {
              ...Object.assign(
                {},
                ...languages.map((lang) => ({
                  [lang.locale]: values[`description[${lang.locale}]`],
                })),
              ),
            },
          },
        }),
      );
      next();
      return;
    }

    if (action_type === 'edit') {
      productUpdate(values, params);
    } else {
      productCreate(values, params);
    }
  };

  function productCreate(values, params) {
    productService
      .create(params)
      .then(({ data }) => {
        console.log("🚀 ~ .then ~ data:", data)
        dispatch(
          replaceMenu({
            id: `product-${data._id}`,
            url: `product/${data._id}`,
            name: t('add.product'),
            data: values,
            refetch: false,
          }),
        );
        navigate(`/product/${data._id}/?step=1`);
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  }

  function productUpdate(values, params) {
    productService
      .update(uuid, params)
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...values, ...activeMenu?.data },
          }),
        );
        next();
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  }

  async function fetchUnits(search = '') {
    const params = {
      perPage: 20,
      page: 1,
      active: 1,
      search: search?.length ? search : undefined,
    };
    return unitService.getAll(params).then(({ data }) => {
      return data?.map((item) => ({
        label: item?.title || item?._id || t('N/A'),
        value: item?._id,
        key: item?._id,
      }));
    });
  }

  async function fetchKitchens({ search = '', page = 1 }) {
    const params = {
      search: search?.length ? search : undefined,
      page,
      perPage: 20,
      active: 1,
      shop_id: shop?.value,
    };
    return kitchenService.getAll(params).then((res) => {
      setHasMore({
        ...hasMore,
        kitchen: res?.meta?.current_page < res?.meta?.last_page,
      });
      return res?.data?.map((item) => ({
        label: item?.title || item?._id || t('N/A'),
        value: item?._id,
        key: item?._id,
      }));
    });
  }

  async function fetchUserShopList(search) {
    const params = { search, active: 1 };
    return shopService.get(params).then((res) =>
      res.data.data.map((item) => ({
        label: item ? item.title : 'no name',
        value: item._id,
      })),
    );
  }

  async function fetchUserBrandList(search) {
    const params = { perPage: 10, type: 'main', search, active: 1 };
    return brandService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item.title,
        value: item._id,
      })),
    );
  }

  async function fetchUserCategoryList(search) {
    const params = {
      perPage: 10,
      type: 'main',
      search,
      shop_id: shop?.value,
      'statuses[0]': 'pending',
      'statuses[1]': 'published',
      active: 1,
    };
    return categoryService.selectPaginate(params).then((res) => {

      return res.data.map((item) => ({
        label: item?.title || '',
        value: item?._id,
        key: item?._id,
        disabled: item?.children?.length > 0,
        children: item?.children?.map((child) => ({
          label: child?.title || '',
          value: child._id,
          key: child._id,
        })),
      }));
    });
  }

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'category/add',
        name: t('add.category'),
      }),
    );
    navigate('/category/add');
  };

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, vegetarian: true, ...activeMenu.data }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={16}>
          <Row>
            <Col span={24}>
              <Card title={t('basic.info')}>
                <Row>
                  <Col span={24}>
                    {/* {languages.map((item) => (
                      <Form.Item
                        key={'name' + item.id}
                        label={t('name')}
                        name={`title[${item.locale}]`}
                        rules={[
                          {
                            validator(_, value) {
                              if (!value && item?.locale === defaultLang) {
                                return Promise.reject(new Error(t('required')));
                              } else if (value && value?.trim() === '') {
                                return Promise.reject(
                                  new Error(t('no.empty.space')),
                                );
                              } else if (value && value?.trim().length < 2) {
                                return Promise.reject(
                                  new Error(t('must.be.at.least.2')),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        hidden={item.locale !== defaultLang}
                      >
                        <Input />
                      </Form.Item>
                    ))} */}

                    <Form.Item
                      key={'name'}
                      label={t('name')}
                      name={`title`}
                      rules={[
                        {
                          required: true,
                          message: "required"
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    {/* {languages.map((item) => (
                      <Form.Item
                        key={'description' + item.id}
                        label={t('description')}
                        name={`description[${item.locale}]`}
                        rules={[
                          {
                            validator(_, value) {
                              if (!value && item?.locale === defaultLang) {
                                return Promise.reject(new Error(t('required')));
                              } else if (value && value?.trim() === '') {
                                return Promise.reject(
                                  new Error(t('no.empty.space')),
                                );
                              } else if (value && value?.trim().length < 2) {
                                return Promise.reject(
                                  new Error(t('must.be.at.least.2')),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        hidden={item.locale !== defaultLang}
                      >
                        <TextArea maxLength={250} rows={3} />
                      </Form.Item>
                    ))} */}

                    <Form.Item
                      key={'description'}
                      label={t('description')}
                      name={`description`}
                      rules={[
                        {
                          required: true,
                          message: "required"
                        },
                      ]}
                    >
                      <TextArea maxLength={250} rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card title={t('pricing')}>
                <Row gutter={12}>
                  <Col span={6}>
                    <Form.Item
                      label={t('min.qty')}
                      name='min_qty'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t('max.qty')}
                      name='max_qty'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber min={0} className='w-100' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t('tax')}
                      name='tax'
                      rules={[
                        {
                          validator(_, value) {
                            if (value && (value < 0 || value > 100)) {
                              return Promise.reject(
                                new Error(t('must.be.between.0.and.100')),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber className='w-100' addonAfter='%' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t('interval.unit')}
                      name='interval'
                      rules={[
                        { required: true, message: t('required') },
                        {
                          type: 'number',
                          min: 0,
                          message: t('must.be.positive'),
                        },
                      ]}
                      help={error?.interval ? error.interval[0] : null}
                      validateStatus={error?.interval ? 'error' : 'success'}
                    >
                      <InputNumber className='w-100' />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card title={t('additions')}>
                <Row gutter={12}>
                  <Col span={6}>
                    <Form.Item
                      label={t('active')}
                      name='active'
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t('vegetarian')}
                      name='vegetarian'
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t(`nutrition.${nutrition ? 'on' : 'off'}`)}
                      valuePropName='checked'
                    >
                      <Switch
                        checked={nutrition}
                        onChange={(e) => setNutrition(e)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            {nutrition && (
              <Col span={24}>
                <Card title={t('nutritional.value.of.product')}>
                  <Row gutter={12}>
                    <Col span={6}>
                      <Form.Item
                        rules={[{ required: true, message: t('required') }]}
                        label={t('kcal')}
                        name='kcal'
                      >
                        <InputNumber min={0} max={10} className='w-100' />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        rules={[{ required: true, message: t('required') }]}
                        label={t('carbs')}
                        name='carbs'
                      >
                        <InputNumber min={0} max={10} className='w-100' />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        rules={[{ required: true, message: t('required') }]}
                        label={t('protein')}
                        name='protein'
                      >
                        <InputNumber min={0} max={10} className='w-100' />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        rules={[{ required: true, message: t('required') }]}
                        label={t('fats')}
                        name='fats'
                      >
                        <InputNumber min={0} max={10} className='w-100' />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )}
          </Row>
        </Col>
        <Col span={8}>
          <Row>
            <Col span={24}>
              <Card title={t('organization')}>
                <Row>
                  {!isRequest && (
                    <Col span={24}>
                      <Form.Item
                        label={t('shop/restaurant')}
                        name='shop'
                        rules={[{ required: true, message: t('required') }]}
                      >
                        <RefetchSearch
                          fetchOptions={fetchUserShopList}
                          onChange={() => {
                            form.setFieldsValue({
                              category: undefined,
                              kitchen: undefined,
                            });
                          }}
                        // disabled={action_type === 'edit'}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={24}>
                    <Form.Item
                      label={t('category')}
                      name='category'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <AsyncTreeSelect
                        disabled={!shop?.value}
                        refetch
                        fetchOptions={fetchUserCategoryList}
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <div className='p-1'>
                              <Button
                                icon={<PlusOutlined />}
                                className='w-100'
                                onClick={goToAddCategory}
                              >
                                {t('add.category')}
                              </Button>
                            </div>
                          </>
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('kitchen')} name='kitchen'>
                      <InfiniteSelect
                        allowClear={false}
                        fetchOptions={fetchKitchens}
                        hasMore={hasMore.kitchen}
                        disabled={!shop?.value}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('brand')} name='brand'>
                      <DebounceSelect fetchOptions={fetchUserBrandList} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t('unit')}
                      name='unit'
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <DebounceSelect fetchOptions={fetchUnits} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={t('sku')} name='sku'>
                      <Input className='w-100' />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card title={t('media')}>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      name='images'
                      rules={[
                        {
                          validator() {
                            if (fileList.length === 0) {
                              return Promise.reject(new Error(t('required')));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <MediaUpload
                        type='products'
                        imageList={fileList}
                        setImageList={setFileList}
                        form={form}
                        multiple={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('next')}
      </Button>
    </Form>
  );
};

export default ProductsIndex;
