import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import invokableService from 'services/rest/invokable';
import { useDispatch } from 'react-redux';
import { verifyCoupon, addCoupon } from 'redux/slices/cart';

const Coupon = ({ coupons = [], currentBag = 0, shopId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentCoupon = useMemo(
    () => coupons?.find((item) => item?.bag_id === currentBag),
    [coupons, currentBag],
  );

  const [loadingBtn, setLoadingBtn] = useState(false);

  const handleCheckCoupon = (shop_id) => {
    const body = {
      shop_id,
      coupon: currentCoupon?.coupon,
    };
    setLoadingBtn(true);
    invokableService
      .checkCoupon(body)
      .then((res) => {
        dispatch(
          verifyCoupon({
            bag_id: currentBag,
            verified: true,
            price: res?.data?.price ?? 0,
            recalculate: !currentCoupon?.recalculate,
          }),
        );
      })
      .catch(() => {
        dispatch(
          verifyCoupon({
            bag_id: currentBag,
            verified: false,
            price: 0,
            reCalculate: !currentCoupon?.recalculate,
          }),
        );
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const handleChange = (value) => {
    dispatch(
      addCoupon({
        bag_id: currentBag,
        coupon: value,
        verified: false,
        price: 0,
        recalculate: !!currentCoupon?.recalculate,
      }),
    );
  };

  return (
    <div className='d-flex my-3'>
      <Input
        placeholder={t('enter.coupon')}
        className='w-100 mr-2'
        addonAfter={
          !!currentCoupon?.verified && (
            <CheckOutlined style={{ color: '#18a695' }} />
          )
        }
        value={currentCoupon?.coupon}
        onChange={(e) => handleChange(e.target.value)}
      />
      <Button
        disabled={
          currentCoupon?.coupon && !currentCoupon?.coupon?.trim()?.length
        }
        onClick={() => handleCheckCoupon(shopId)}
        loading={loadingBtn}
      >
        {t('check')}
      </Button>
    </div>
  );
};

export default Coupon;
