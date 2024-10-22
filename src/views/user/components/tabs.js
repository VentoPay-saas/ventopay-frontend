import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';
import { updateUserFilters, updateUserParams } from 'redux/slices/user';
import { updateClientFilters } from 'redux/slices/client';

// prop type can be "client" | "user"

export default function UserTabs({ options, activeOption, type = 'client' }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleChange = (tab) => {
    if (type === 'user') {
      batch(() => {
        dispatch(updateUserFilters({ status: tab }));
        dispatch(updateUserParams({ page: 1 }));
      });
    } else if (type === 'client') {
      batch(() => {
        dispatch(updateClientFilters({ status: tab }));
        dispatch(updateClientFilters({ page: 1 }));
      });
    }
  };

  return (
    <Tabs
      onChange={handleChange}
      type='card'
      activeKey={activeOption}
      scroll={{ x: true }}
    >
      {options?.map((option) => (
        <Tabs.TabPane key={option} tab={t(option)} />
      ))}
    </Tabs>
  );
}
