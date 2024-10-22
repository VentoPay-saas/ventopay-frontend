import React, { useState } from 'react';
import { Card, Col, Row } from 'antd';
import { DebounceSelect } from 'components/search';
import brandService from 'services/rest/brand';
import useDidUpdate from 'helpers/useDidUpdate';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSellerProducts } from 'redux/slices/product';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';

const Filter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState(null);
  const { user } = useSelector((state) => state.auth, shallowEqual);

  async function fetchUserBrand(username) {
    const params = {
      search: username.length === 0 ? null : username,
    };
    return brandService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  useDidUpdate(() => {
    const params = {
      brand_id: brand?.value,
      category_id: category?.value,
      search,
      active: 1,
      status: 'published',
    };
    dispatch(fetchSellerProducts(params));
  }, [brand, category, search]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={12}>
          <SearchInput
            className='w-100'
            placeholder={t('search')}
            handleChange={setSearch}
          />
        </Col>
        {user?.shop?.type === 'shop' ? (
          <Col span={6}>
            <DebounceSelect
              className='w-100'
              placeholder={t('select.brand')}
              fetchOptions={fetchUserBrand}
              onChange={(value) => setBrand(value)}
              value={brand}
            />
          </Col>
        ) : undefined}
      </Row>
    </Card>
  );
};
export default Filter;
