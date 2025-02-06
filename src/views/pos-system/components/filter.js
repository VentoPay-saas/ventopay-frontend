import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import shopService from 'services/shop';
import brandService from 'services/brand';
import categoryService from 'services/category';
import useDidUpdate from 'helpers/useDidUpdate';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchRestProducts } from 'redux/slices/product';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import { clearCart, setCartData } from 'redux/slices/cart';
import { disableRefetch } from 'redux/slices/menu';
import { getCartData } from 'redux/selectors/cartSelector';
import { InfiniteSelect } from 'components/infinite-select';
import createSelectObject from 'helpers/createSelectObject';

const Filter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { allShops } = useSelector((state) => state.allShops, shallowEqual);
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);

  const activeShop = createSelectObject(allShops[0]);
  const cartData = useSelector((state) => getCartData(state.cart));
  const [links, setLinks] = useState(null);

  async function fetchUserShop({ search = '', page = 1 }) {
    const params = {
      search: search?.length ? search : undefined,
      page,
      status: 'approved',
    };
    return shopService.search(params).then((res) => {
      setLinks(res.links);
      return res.data.map((item) => ({
        label: item?.title || t('N/A'),
        value: item?._id,
        key: item?._id,
      }));
    });
  }

  async function fetchUserBrand({ search = '', page = 1 }) {
    const params = { search: search?.length ? search : undefined, page };
    return brandService.search(params).then((res) => {
      setLinks(res.links);
      return res.data.map((item) => ({
        label: item?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  }

  async function fetchUserCategory({ search = '', page = 1 }) {
    const params = {
      search: search?.length ? search : undefined,
      page,
      type: 'main',
    };
    return categoryService.search(params).then((res) => {
      setLinks(res.links);
      return res.data.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  }

  useDidUpdate(() => {
    if (cartData?.shop?.value) {
      const params = {
        brand_id: brand?.value,
        category_id: category?.value,
        search: search?.length ? search : undefined,
        shop_id: !!cartData?.shop?.value
          ? cartData?.shop?.value
          : activeShop?.value,
        status: 'published',
        active: 1,
      };
      dispatch(fetchRestProducts(params));
    }
  }, [brand, category, search, cartData?.shop?.value]);

  useEffect(() => {
    if (activeMenu.refetch) {
      batch(() => {
        dispatch(setCartData({ bag_id: currentBag, shop: activeShop }));
        dispatch(disableRefetch(activeMenu));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  useEffect(() => {
    if (!cartData?.shop?.value) {
      dispatch(
        setCartData({
          bag_id: currentBag,
          shop: activeShop,
          deliveryZone: null,
          table: null,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData?.shop?.value]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={6}>
          <SearchInput
            className='w-100'
            placeholder={t('search')}
            handleChange={setSearch}
          />
        </Col>
        <Col span={6}>
          <InfiniteSelect
            className='w-100'
            hasMore={links?.next}
            debounceTimeout={500}
            placeholder={t('select.shop')}
            fetchOptions={fetchUserShop}
            allowClear={false}
            onChange={(value) => {
              batch(() => {
                dispatch(setCartData({ bag_id: currentBag, shop: value }));
                dispatch(clearCart());
              });
            }}
            value={cartData?.shop}
          />
        </Col>
        <Col span={6}>
          <InfiniteSelect
            className='w-100'
            hasMore={links?.next}
            placeholder={t('select.category')}
            fetchOptions={fetchUserCategory}
            onChange={(value) => setCategory(value)}
            value={category}
          />
        </Col>
        <Col span={6}>
          <InfiniteSelect
            hasMore={links?.next}
            className='w-100'
            placeholder={t('select.brand')}
            fetchOptions={fetchUserBrand}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default Filter;
