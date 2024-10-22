import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import extraService from '../../../services/seller/extras';
import productService from '../../../services/seller/product';
import { AsyncSelect } from '../../../components/async-select';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DebounceSelect } from '../../../components/search';
import Loading from '../../../components/loading';
import cartesian from 'helpers/cartesian';
import { DeleteOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { setMenuData, setRefetch } from 'redux/slices/menu';
import generateRandomNumbers from '../../../helpers/generateRandomNumbers';

const ProductStock = ({ prev, next, isRequest, mode }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const [loading, setLoading] = useState(null);
  const location = useLocation();
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);
  const { settings } = useSelector((state) => state.globalSettings);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  const randomNumbersLength = 6;

  const [loadingBtn, setLoadingBtn] = useState(null);
  const [stockIds, setStockIds] = useState([]);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const { stocks } = values;
    let isExtrasChanged = stocks.filter(
      ({ price: priceOfActualStock, quantity: quantityOfActualStock }) =>
        !activeMenu?.data?.stocks?.some(
          ({ price, quantity }) =>
            priceOfActualStock === price || quantityOfActualStock === quantity,
        ),
    );
    let extras;
    const isProductWithExtras = !!activeMenu.data?.extras?.length;
    if (isProductWithExtras) {
      extras = stocks.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        ids:
          (isExtrasChanged.length > 0 || isRequest || location.state) &&
          !location.state?.create &&
          settings?.product_auto_approve === '0'
            ? activeMenu.data?.extras.map((_, idx) => item[`extras[${idx}]`])
            : activeMenu.data?.extras.map(
                (_, idx) => item[`extras[${idx}]`].value,
              ),
        addons: item.addons
          ? (isExtrasChanged.length > 0 || isRequest || location.state) &&
            !location.state?.create &&
            settings?.product_auto_approve !== '1'
            ? item.addons?.map((i) => i)
            : item.addons?.map((i) => i.value)
          : [],
        stock_id: item.stock_id,
        sku: item.sku,
      }));
    } else {
      extras = [
        {
          price: stocks[0].price,
          quantity: stocks[0].quantity,
          addons: stocks[0].addons
            ? (isExtrasChanged.length > 0 || isRequest || location.state) &&
              !location.state?.create &&
              settings?.product_auto_approve !== '1'
              ? stocks[0].addons.map((i) => i)
              : stocks[0].addons.map((i) => i.value)
            : [],
          stock_id: stocks[0].stock_id,
          sku: stocks[0].sku,
        },
      ];
    }

    const delete_ids = stockIds.filter(
      (stockId, index) =>
        stocks[index]?.stock_id &&
        !stocks.some((stock) => stock?.stock_id === stockId),
    );

    let tempState = location.state;
    if (isRequest) {
      dispatch(
        setMenuData({
          activeMenu,
          data: { ...activeMenu.data, stocks: extras, delete_ids },
        }),
      );
      next();
      return;
    }

    if (
      (isExtrasChanged.length > 0 || location.state) &&
      mode === 'edit' &&
      !location.state?.create &&
      settings?.product_auto_approve === '0'
    ) {
      if (location.state) {
        tempState.stocks = extras;
        tempState.delete_ids = delete_ids;
      } else {
        tempState = { ...activeMenu.data, stocks: extras, delete_ids };
      }
      navigate(`/seller/product/${uuid}?step=3`, { state: tempState });
      return;
    }

    productService
      .stocks(uuid, { extras, delete_ids })
      .then(() => {
        next();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  function populateStocks(extras, actualStocks) {
    const additionalStocks = cartesian(extras);

    const parsedAdditionalStocks = additionalStocks.map((item) => {
      if (
        item.every((itemValue) => typeof itemValue.stock_id !== 'undefined')
      ) {
        const selectedStock = actualStocks?.find((stock) => {
          return stock.extras.every((extra) => {
            return item.some((addStock) => addStock.value === extra.id);
          });
        });
        const selectedAddons = [];
        selectedStock?.addons?.forEach((item) => {
          if (item.product) {
            selectedAddons.push({
              label: item?.product?.translation?.title || item?.label,
              value: item?.product?.id || item?.value,
            });
          }
        });
        return {
          price: selectedStock?.price || 0,
          quantity: selectedStock?.quantity || 0,
          sku: selectedStock?.sku,
          stock_id: selectedStock?.id,
          tax: activeMenu?.data.tax || 0,
          addons: selectedAddons,
          ...Object.assign(
            {},
            ...item.map((extra, idx) => ({
              [`extras[${idx}]`]: {
                label: extra.label,
                value: extra.value,
                group: extra.group.translation?.title,
              },
            })),
          ),
        };
      }

      return {
        price: undefined,
        quantity: 0,
        tax: activeMenu.data?.tax || 0,
        sku: activeMenu?.data?.sku,
        addons: [],
        ...Object.assign(
          {},
          ...item.map((extra, idx) => ({
            [`extras[${idx}]`]: {
              label: extra.label,
              value: extra.value,
            },
          })),
        ),
      };
    });
    let defaultStock = [];
    if (additionalStocks.length === 0 && actualStocks?.length !== 0) {
      const stockWithoutExtras = actualStocks?.at(0);
      const selectedAddons = [];
      stockWithoutExtras?.addons?.forEach((item) => {
        if (item.product) {
          selectedAddons.push({
            label: item?.product?.translation?.title || item?.label,
            value: item?.product?.id || item?.value,
          });
        }
      });
      defaultStock = [
        {
          price: stockWithoutExtras?.price || 0,
          quantity: stockWithoutExtras?.quantity || 0,
          sku: stockWithoutExtras?.sku,
          tax: activeMenu.data?.tax || 0,
          addons: stockWithoutExtras ? selectedAddons : [],
        },
      ];
    }
    if (additionalStocks.length === 0 && actualStocks?.length === 0) {
      defaultStock = [
        {
          price: undefined,
          quantity: 0,
          sku: activeMenu?.data?.sku,
          tax: activeMenu.data?.tax || 0,
          addons: [],
        },
      ];
    }
    const stocks = defaultStock.concat(parsedAdditionalStocks);
    setStockIds(actualStocks.map((item) => item.id));
    form.setFieldsValue({
      stocks,
    });
  }

  function fetchProduct(uuid) {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        populateStocks(
          activeMenu?.data.extras?.map((extra) => extra.values || []),
          res.data.stocks,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function fetchExtra(id) {
    return extraService.getGroupById(id).then((res) =>
      res.data.extra_values.map((item) => ({
        label: item.value,
        value: item.id,
      })),
    );
  }

  const fetchAddons = (search) => {
    const params = {
      search,
      addon: 1,
      shop_id: myShop.id,
      active: 1,
      'statuses[0]': 'published',
      'statuses[1]': 'pending',
    };
    return productService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item?.translation?.title,
        value: item?.id,
      })),
    );
  };

  useEffect(() => {
    if (isRequest) {
      if (location.state?.generate) {
        const additionalStocks = cartesian(
          activeMenu?.data.extras?.map((extra) => extra.values || []),
        );

        const parsedAdditionalStocks = additionalStocks.map((item) => {
          if (
            item.every((itemValue) => typeof itemValue.stock_id !== 'undefined')
          ) {
            const selectedStock = activeMenu.data?.actualStocks?.find(
              (stock) => {
                return stock.extras.every((extra) => {
                  return item.some((addStock) => addStock.value === extra.id);
                });
              },
            );
            const selectedAddons = [];
            selectedStock?.addons?.forEach((item) => {
              if (item.product) {
                selectedAddons.push({
                  label: item?.product?.translation?.title || item?.label,
                  value: item?.product?.id || item?.value,
                });
              }
            });
            return {
              price: selectedStock?.price || 0,
              quantity: selectedStock?.quantity || 0,
              stock_id: selectedStock?.id,
              sku: selectedStock?.sku,
              tax: activeMenu?.data.tax || 0,
              addons: selectedAddons,
              ...Object.assign(
                {},
                ...item.map((extra, idx) => ({
                  [`extras[${idx}]`]: {
                    label: extra.label,
                    value: extra.value,
                    group: activeMenu.data.extras[idx].label,
                  },
                })),
              ),
            };
          }

          return {
            price: 0,
            quantity: 0,
            tax: activeMenu.data?.tax || 0,
            sku: activeMenu?.data?.sku,
            addons: [],
            ...Object.assign(
              {},
              ...item.map((extra, idx) => ({
                [`extras[${idx}]`]: {
                  label: extra.label,
                  value: extra.value,
                },
              })),
            ),
          };
        });
        let defaultStock = [];
        if (
          additionalStocks.length === 0 &&
          activeMenu.data?.actualStocks?.length !== 0
        ) {
          const stockWithoutExtras = activeMenu.data.actualStocks?.at(0);
          const selectedAddons = [];
          stockWithoutExtras?.addons?.forEach((item) => {
            if (item.product) {
              selectedAddons.push({
                label: item?.product?.translation?.title || item?.label,
                value: item?.product?.id || item?.value,
              });
            }
          });
          defaultStock = [
            {
              price: stockWithoutExtras?.price || 0,
              quantity: stockWithoutExtras?.quantity || 0,
              sku: stockWithoutExtras?.sku,
              tax: activeMenu.data?.tax || 0,
              addons: stockWithoutExtras ? selectedAddons : [],
            },
          ];
        }
        if (
          additionalStocks?.length === 0 &&
          activeMenu.data?.actualStocks?.length === 0
        ) {
          defaultStock = [
            {
              price: undefined,
              quantity: 0,
              sku: activeMenu?.data?.sku,
              tax: activeMenu.data?.tax || 0,
              addons: [],
            },
          ];
        }
        const stocks = defaultStock.concat(parsedAdditionalStocks);
        setStockIds(activeMenu.data.actualStocks.map((item) => item.id));
        form.setFieldsValue({
          stocks,
        });
      } else {
        const stocks = activeMenu.data.stocks.map((stock) => ({
          price: stock.price || 0,
          quantity: stock.quantity || 0,
          tax: activeMenu.data.tax,
          sku: stock.sku,
          stock_id: stock.stock_id,
          ...Object.assign(
            {},
            ...stock.ids?.map((extra, idx) => ({
              [`extras[${idx}]`]: {
                label: extra.label,
                value: extra.value,
                group: extra.group,
              },
            })),
          ),
        }));
        setStockIds(activeMenu.data?.delete_ids || []);
        form.setFieldsValue({
          stocks,
        });
      }
    } else {
      fetchProduct(uuid);
    }
  }, [isRequest, location.state?.generate]);

  function handleSetAllAddons(value) {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({
      stocks: assignObject(stocks, 'addons', value),
    });
  }

  function handleSetAllQuantity(value) {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({ stocks: assignObject(stocks, 'quantity', value) });
  }

  function handleSetAllPrice(value) {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({ stocks: assignObject(stocks, 'price', value) });
  }

  const assignObject = (obj, key, value) =>
    obj.map((item) => Object.assign(item, { [key]: value }));

  const handleSetAllSku = (generateRandom, value) => {
    const skuValue = generateRandom
      ? generateRandomNumbers(randomNumbersLength)
      : value;
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({
      'set.all.sku': skuValue,
      stock: assignObject(stocks, 'sku', skuValue),
    });
  };

  return (
    <Card
      title={
        activeMenu.data && activeMenu.data[`title[${defaultLang}]`]
          ? `${activeMenu.data[`title[${defaultLang}]`]}`
          : ''
      }
    >
      {loading ? (
        <Loading />
      ) : (
        <Form layout='vertical' form={form} onFinish={onFinish}>
          <Divider />
          <h2>{t('set.all.values')}</h2>
          <Row gutter={12} align='middle'>
            <Col span={5} style={{ marginRight: '10px' }}>
              <Form.Item label={t('sku')} name='set.all.sku'>
                <Input
                  className='w-100'
                  onChange={(e) => handleSetAllSku(false, e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={' '} name='sku'>
                <Button
                  icon={<DeploymentUnitOutlined />}
                  onClick={() => handleSetAllSku(true)}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={t('price')}
                name={'set.all.price'}
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    message: t('must.be.positive.number'),
                  },
                ]}
              >
                <InputNumber className='w-100' onChange={handleSetAllPrice} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={t('quantity')}
                name={'set.all.quantity'}
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    message: t('must.be.positive.number'),
                  },
                ]}
              >
                <InputNumber
                  className='w-100'
                  onChange={handleSetAllQuantity}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={t('addons')} name={'addons'}>
                <DebounceSelect
                  mode='multiple'
                  style={{ minWidth: '300px' }}
                  fetchOptions={fetchAddons}
                  allowClear={true}
                  onChange={handleSetAllAddons}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <h2>{t('values')}</h2>
          <Form.List name='stocks'>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, index) => {
                    return (
                      <Row
                        key={field.key}
                        gutter={12}
                        align='middle'
                        style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
                        hidden={!activeMenu.data?.extras?.length && field.key}
                      >
                        {activeMenu.data?.extras?.map((item, idx) => (
                          <Col key={'extra' + item.value}>
                            <Form.Item
                              label={item?.label}
                              name={[index, `extras[${idx}]`]}
                              rules={[
                                { required: true, message: t('required') },
                              ]}
                            >
                              <AsyncSelect
                                fetchOptions={() => fetchExtra(item.value)}
                                className='w-100'
                                disabled
                                style={{ minWidth: 200 }}
                              />
                            </Form.Item>
                          </Col>
                        ))}
                        <Col>
                          <Form.Item
                            label={t('addons')}
                            name={[index, 'addons']}
                            rules={[
                              { required: false, message: t('required') },
                            ]}
                          >
                            <DebounceSelect
                              mode='multiple'
                              style={{ minWidth: '300px' }}
                              fetchOptions={fetchAddons}
                              allowClear={true}
                            />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item label={t('sku')} name={[index, 'sku']}>
                            <Input
                              className='w-100'
                              style={{ minWidth: 200 }}
                            />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item
                            label={t('quantity')}
                            name={[index, 'quantity']}
                            rules={[{ required: true, message: t('required') }]}
                          >
                            <InputNumber
                              min={0}
                              className='w-100'
                              style={{ minWidth: 200 }}
                            />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item
                            label={`${t('price')} (${defaultCurrency?.symbol})`}
                            name={[index, 'price']}
                            rules={[{ required: true, message: t('requried') }]}
                          >
                            <InputNumber
                              min={0}
                              className='w-100'
                              style={{ minWidth: 200 }}
                            />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item label={t('tax')} name={[index, 'tax']}>
                            <InputNumber
                              className='w-100'
                              disabled
                              style={{ minWidth: 200 }}
                              addonAfter='%'
                            />
                          </Form.Item>
                          <Form.Item
                            hidden
                            label={t('id')}
                            name={[index, 'stock_id']}
                          >
                            <InputNumber
                              className='w-100'
                              disabled
                              style={{ minWidth: 200 }}
                              addonAfter='%'
                            />
                          </Form.Item>
                        </Col>{' '}
                        <Col>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, nextValues) =>
                              prevValues.stocks[field.name].price !==
                              nextValues.stocks[field.name].price
                            }
                          >
                            {({ getFieldValue }) => {
                              const tax =
                                getFieldValue(['stocks', field.name, 'tax']) ||
                                0;

                              const price = getFieldValue([
                                'stocks',
                                field.name,
                                'price',
                              ]);
                              const totalPrice =
                                tax === 0 ? price : (price * tax) / 100 + price;
                              return (
                                <Form.Item
                                  label={`${t('total.price')} (${
                                    defaultCurrency?.symbol
                                  })`}
                                >
                                  <InputNumber
                                    min={1}
                                    disabled
                                    value={totalPrice}
                                    className='w-100'
                                    style={{ minWidth: 200 }}
                                  />
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        </Col>
                        <Col>
                          {field.key ? (
                            <Button
                              type='primary'
                              className='mt-2'
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          ) : (
                            ''
                          )}
                        </Col>
                      </Row>
                    );
                  })}
                </div>
              );
            }}
          </Form.List>
          <Space className='mt-4'>
            <Button onClick={prev}>{t('prev')}</Button>
            <Button type='primary' htmlType='submit' loading={!!loadingBtn}>
              {t('next')}
            </Button>
          </Space>
        </Form>
      )}
    </Card>
  );
};

export default ProductStock;
