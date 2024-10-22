import React from 'react';
import { Button, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateParams } from 'redux/slices/statistics/count';

const statisticsTime = [
  {
    label: 'this.week',
    value: 'subWeek',
  },
  {
    label: 'this.month',
    value: 'subMonth',
  },
  {
    label: 'this.year',
    value: 'subYear',
  },
];

export default function TopBar() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const dispatch = useDispatch();
  const { params } = useSelector(
    (state) => state.statisticsCount,
    shallowEqual
  );

  const handleUpdateTime = (time) => {
    dispatch(updateParams({ type: time }));
  };

  return (
    <Card>
      <div className='d-flex justify-content-between'>
        <div>
          <h2>
            {t('hello')}, {user.fullName} 👋
          </h2>
          <p>{t('hello.text')}</p>
        </div>
        <Space>
          {statisticsTime.map((time) => (
            <Button
              key={time.value}
              onClick={() => handleUpdateTime(time.value)}
              type={params?.type === time.value ? 'primary' : 'default'}
            >
              {t(time.label)}
            </Button>
          ))}
        </Space>
      </div>
    </Card>
  );
}
