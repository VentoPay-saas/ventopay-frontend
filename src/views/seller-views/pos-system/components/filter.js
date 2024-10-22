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

  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const [brand, setBrand] = useState(null);
  const [search, setSearch] = useState(null);

  async function fetchUserBrand(username) {
    const params = {
      search: username.length === 0 ? null : username,
    };
    return await brandService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      })),
    );
  }

  useDidUpdate(() => {
    const params = {
      search: search?.length ? search : undefined,
      active: 1,
      status: 'published',
      brand_id: brand?.value || undefined,
      perPage: 12,
    };
    dispatch(fetchSellerProducts(params));
  }, [search, brand?.value]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={8}>
          <SearchInput
            className='w-100'
            placeholder={t('search')}
            handleChange={setSearch}
          />
        </Col>
        {myShop.type === 'shop' && (
          <Col span={8}>
            <DebounceSelect
              className='w-100'
              placeholder={t('select.brand')}
              fetchOptions={fetchUserBrand}
              onChange={(value) => setBrand(value)}
              value={brand}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};
export default Filter;
